import React, {Component} from 'react';
import * as Expo from 'react-native';
import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import uuidv4 from 'uuid/v4';
import DeviceInfo from 'react-native-device-info';
import sprintfJs from 'sprintf-js';
import {Buffer} from 'buffer';
import WebView from 'react-native-webview';
import CreditCard from 'react-native-credit-card-form-ui';
import {Button} from 'react-native-elements';

const API_URL_SANDBOX = 'https://sandbox-api.openpay.mx';
const API_URL_PRODUCTION = 'https://api.openpay.mx';

const vsprintf = sprintfJs.vsprintf;
let sessionId = uuidv4();
sessionId = sessionId.toUpperCase().replace(/-/g, '');

export const createTokenWithCard = async (data) => {
  const method = 'POST';
  const resource = 'tokens';
  return await sendFunction(method, resource, data);
};

const sendFunction = (method, resource, data) => {
  const username = data.publicKey;
  const url = vsprintf('%s/v1/%s/%s', [
    data.isProductionMode ? API_URL_PRODUCTION : API_URL_SANDBOX,
    data.merchantId,
    resource,
  ]);
  const authorization =
    'Basic ' + new Buffer(username + ':').toString('base64');

  return fetch(url, {
    method: method,
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json()) // parses response to JSON
    .catch((error) => {
      throw error;
    });
};

export default class Openpay extends Component {
  creditCardRef;

  constructor(props) {
    super(props);

    this.creditCardRef = React.createRef();

    if (!this.validateProps(props)) {
      throw new Error('Openpay component requires all the specified props.');
    }
    this.state = {
      sessionId: undefined,
      uri: '',
      injectedJavaScript: '',
      loading: false,
    };
  }

  componentDidMount() {
    this.createDeviceSessionId();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({loading: nextProps.loading}));
  }

  validateProps = (props) => {
    // Se valida que existan las propiedad requeridas
    if (
      !props.hasOwnProperty('isProductionMode') ||
      !props.hasOwnProperty('merchantId') ||
      !props.hasOwnProperty('publicKey') ||
      !props.hasOwnProperty('successToken') ||
      !props.hasOwnProperty('failToken') ||
      !props.hasOwnProperty('custom')
    ) {
      return false;
    }

    // Se validan los tipos de dato
    if (!isBoolean(props.isProductionMode)) {
      return false;
    }

    if (!isString(props.merchantId)) {
      return false;
    }

    if (!isString(props.publicKey)) {
      return false;
    }

    if (!isFunction(props.successToken)) {
      return false;
    }

    if (!isFunction(props.failToken)) {
      return false;
    }

    if (!isBoolean(props.custom)) {
      return false;
    }

    if (!isBoolean(props.custom)) {
      return false;
    } else if (props.custom && !isFunction(props.deviceSession)) {
      return false;
    }

    if (props.hasOwnProperty('address') && !isObject(props.address)) {
      return false;
    }

    return true;
  };

  createDeviceSessionId = () => {
    let identifierForVendor = this.identifierForVendor();
    identifierForVendor = identifierForVendor.replace(/-/g, '');

    const uri = vsprintf('%s/oa/logo.htm?m=%s&s=%s', [
      this.props.isProductionMode ? API_URL_PRODUCTION : API_URL_SANDBOX,
      this.props.merchantId,
      sessionId,
    ]);
    const injectedJavaScript = vsprintf('var identifierForVendor = "%s";', [
      identifierForVendor,
    ]);

    this.setState(() => ({uri, injectedJavaScript}));
    this.props.deviceSession(sessionId);
  };

  identifierForVendor = () => {
    let deviceSerial = '';
    try {
      if (window.Expo && window.Expo.Constants.appOwnership === 'expo') {
        console.log('Running in expo');
        deviceSerial =
          typeof Expo.Constants.installationId !== 'undefined'
            ? Expo.Constants.installationId
            : Expo.Constants.deviceId;
      } else {
        deviceSerial = DeviceInfo.getUniqueId();
      }
    } catch (e) {
      console.log('error reading device ID', e);
    }

    return deviceSerial;
  };

  tokenize = async (form) => {
    console.log('******** tokenize ******');
    const cardForm = form;

    this.setState(() => ({loading: true}));

    const card = cardForm;
    const expirationDate = card.expiration.split('/');
    const requestData = {
      card_number: card.number.replace(/ /g, ''),
      holder_name: card.holder,
      cvv2: card.cvv,
      expiration_month: expirationDate[0],
      expiration_year: expirationDate[1],
      isProductionMode: this.props.isProductionMode,
      merchantId: this.props.merchantId,
      publicKey: this.props.publicKey,
    };

    if (this.props.address) {
      requestData.address = this.props.address;
    }

    try {
      const response = await createTokenWithCard(requestData);
      if (response.error_code) {
        this.props.failToken(response);
      } else {
        this.props.successToken(response);
      }
    } catch (error) {
      this.props.failToken(error);
    }
  };

  render() {
    const labels = {
      holder: 'Full Name',
      expiration: 'Expiration Date',
      cvv: 'Security Code',
    };

    const placeholders = {
      holder: "Holder's Name",
      number: '**** **** **** ****',
      expiration: 'MM/YY',
      cvv: 'CVV',
    };

    const {uri, injectedJavaScript, loading} = this.state;

    const handleSubmit = async () => {
      if (this.creditCardRef.current) {
        const {error, data} = this.creditCardRef.current.submit();
        console.log('ERROR: ', error);
        console.log('CARD DATA: ', data);
        await this.tokenize(data);
      }
    };

    const background = '#ff7600';
    const placeholderTextColor = '#ffffff';

    const CardWrapper = () => {
      if (!this.props.custom) {
        return (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={20}
          >
            <CreditCard
              ref={this.creditCardRef}
              labels={labels}
              placeholders={placeholders}
              background={background}
              placeholderTextColor={placeholderTextColor}
            />
            <Button
              buttonStyle={styles.button}
              title={this.props.buttonText}
              onPress={handleSubmit}
            />
          </KeyboardAvoidingView>
        );
      } else {
        return <View/>;
      }
    };

    return (
      <View style={styles.container}>
        <CardWrapper/>
        <WebView
          source={{uri: uri}}
          injectedJavaScript={injectedJavaScript}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 400,
  },
  button: {
    height: 45,
    backgroundColor: '#ff7600',
    borderColor: '#ff7600',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    justifyContent: 'center',
    marginTop: 30,
    padding: 5,
    width: '100%',
  },
});

const isFunction = (value) => {
  return typeof value === 'function';
};

const isObject = (value) => {
  return value && typeof value === 'object' && value.constructor === Object;
};

const isString = (value) => {
  return typeof value === 'string' || value instanceof String;
};

const isBoolean = (value) => {
  return typeof value === 'boolean';
};

const isNumber = (value) => {
  return typeof value === 'number' && isFinite(value);
};

const isNull = (value) => {
  return value === null;
};

// Returns if a value is undefined
const isUndefined = (value) => {
  return typeof value === 'undefined';
};
