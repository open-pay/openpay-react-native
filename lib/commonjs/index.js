"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.createTokenWithCard = void 0;

var _react = _interopRequireWildcard(require("react"));

var Expo = _interopRequireWildcard(require("react-native"));

var _v = _interopRequireDefault(require("uuid/v4"));

var _reactNativeDeviceInfo = _interopRequireDefault(require("react-native-device-info"));

var _sprintfJs = _interopRequireDefault(require("sprintf-js"));

var _buffer = require("buffer");

var _reactNativeWebview = _interopRequireDefault(require("react-native-webview"));

var _reactNativeCreditCardFormUi = _interopRequireDefault(require("react-native-credit-card-form-ui"));

var _reactNativeElements = require("react-native-elements");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const API_URL_SANDBOX = 'https://sandbox-api.openpay.mx';
const API_URL_PRODUCTION = 'https://api.openpay.mx';
const vsprintf = _sprintfJs.default.vsprintf;
let sessionId = (0, _v.default)();
sessionId = sessionId.toUpperCase().replace(/-/g, '');

const createTokenWithCard = async data => {
  const method = 'POST';
  const resource = 'tokens';
  return await sendFunction(method, resource, data);
};

exports.createTokenWithCard = createTokenWithCard;

const sendFunction = (method, resource, data) => {
  const username = data.publicKey;
  const url = vsprintf('%s/v1/%s/%s', [data.isProductionMode ? API_URL_PRODUCTION : API_URL_SANDBOX, data.merchantId, resource]);
  const authorization = 'Basic ' + new _buffer.Buffer(username + ':').toString('base64');
  return fetch(url, {
    method: method,
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authorization
    },
    body: JSON.stringify(data)
  }).then(response => response.json()) // parses response to JSON
  .catch(error => {
    throw error;
  });
};

class Openpay extends _react.Component {
  constructor(_props) {
    super(_props);

    _defineProperty(this, "creditCardRef", void 0);

    _defineProperty(this, "validateProps", props => {
      // Se valida que existan las propiedad requeridas
      if (!props.hasOwnProperty('isProductionMode') || !props.hasOwnProperty('merchantId') || !props.hasOwnProperty('publicKey') || !props.hasOwnProperty('successToken') || !props.hasOwnProperty('failToken') || !props.hasOwnProperty('custom')) {
        return false;
      } // Se validan los tipos de dato


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
    });

    _defineProperty(this, "createDeviceSessionId", () => {
      let identifierForVendor = this.identifierForVendor();
      identifierForVendor = identifierForVendor.replace(/-/g, '');
      const uri = vsprintf('%s/oa/logo.htm?m=%s&s=%s', [this.props.isProductionMode ? API_URL_PRODUCTION : API_URL_SANDBOX, this.props.merchantId, sessionId]);
      const injectedJavaScript = vsprintf('var identifierForVendor = "%s";', [identifierForVendor]);
      this.setState(() => ({
        uri,
        injectedJavaScript
      }));
      this.props.deviceSession(sessionId);
    });

    _defineProperty(this, "identifierForVendor", () => {
      let deviceSerial = '';

      try {
        if (window.Expo && window.Expo.Constants.appOwnership === 'expo') {
          console.log('Running in expo');
          deviceSerial = typeof Expo.Constants.installationId !== 'undefined' ? Expo.Constants.installationId : Expo.Constants.deviceId;
        } else {
          deviceSerial = _reactNativeDeviceInfo.default.getUniqueId();
        }
      } catch (e) {
        console.log('error reading device ID', e);
      }

      return deviceSerial;
    });

    _defineProperty(this, "tokenize", async form => {
      console.log('******** tokenize ******');
      const cardForm = form;
      this.setState(() => ({
        loading: true
      }));
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
        publicKey: this.props.publicKey
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
    });

    this.creditCardRef = /*#__PURE__*/_react.default.createRef();

    if (!this.validateProps(_props)) {
      throw new Error('Openpay component requires all the specified props.');
    }

    this.state = {
      sessionId: undefined,
      uri: '',
      injectedJavaScript: '',
      loading: false
    };
  }

  componentDidMount() {
    this.createDeviceSessionId();
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      loading: nextProps.loading
    }));
  }

  render() {
    const labels = {
      holder: 'Full Name',
      expiration: 'Expiration Date',
      cvv: 'Security Code'
    };
    const placeholders = {
      holder: "Holder's Name",
      number: '**** **** **** ****',
      expiration: 'MM/YY',
      cvv: 'CVV'
    };
    const {
      uri,
      injectedJavaScript,
      loading
    } = this.state;

    const handleSubmit = async () => {
      if (this.creditCardRef.current) {
        const {
          error,
          data
        } = this.creditCardRef.current.submit();
        console.log('ERROR: ', error);
        console.log('CARD DATA: ', data);
        await this.tokenize(data);
      }
    };

    const CardWrapper = () => {
      if (!this.props.custom) {
        return /*#__PURE__*/_react.default.createElement(Expo.KeyboardAvoidingView, {
          behavior: Expo.Platform.OS === 'ios' ? 'padding' : 'height',
          keyboardVerticalOffset: 20
        }, /*#__PURE__*/_react.default.createElement(_reactNativeCreditCardFormUi.default, {
          ref: this.creditCardRef,
          labels: labels,
          placeholders: placeholders
        }), /*#__PURE__*/_react.default.createElement(_reactNativeElements.Button, {
          buttonStyle: styles.button,
          title: this.props.buttonText,
          onPress: handleSubmit
        }));
      } else {
        return /*#__PURE__*/_react.default.createElement(Expo.View, null);
      }
    };

    return /*#__PURE__*/_react.default.createElement(Expo.View, {
      style: styles.container
    }, /*#__PURE__*/_react.default.createElement(CardWrapper, null), /*#__PURE__*/_react.default.createElement(_reactNativeWebview.default, {
      source: {
        uri: uri
      },
      injectedJavaScript: injectedJavaScript
    }));
  }

}

exports.default = Openpay;
const styles = Expo.StyleSheet.create({
  container: {
    paddingBottom: 400
  },
  button: {
    height: 45,
    backgroundColor: '#ff8c37',
    borderColor: '#ff8c37',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    justifyContent: 'center',
    marginTop: 30,
    padding: 5,
    width: '100%'
  }
});

const isFunction = value => {
  return typeof value === 'function';
};

const isObject = value => {
  return value && typeof value === 'object' && value.constructor === Object;
};

const isString = value => {
  return typeof value === 'string' || value instanceof String;
};

const isBoolean = value => {
  return typeof value === 'boolean';
};

const isNumber = value => {
  return typeof value === 'number' && isFinite(value);
};

const isNull = value => {
  return value === null;
}; // Returns if a value is undefined


const isUndefined = value => {
  return typeof value === 'undefined';
};
//# sourceMappingURL=index.js.map