# Openpay React Native ![CI status](https://img.shields.io/badge/build-passing-brightgreen.svg)

openpay-react-native Generates the device_session_id and tokenize the credit cards with Openpay.

![Openpay React Native](https://image.ibb.co/h6Ac89/screenshot.png)

## Features
* Generates the device_session_id (https://openpay.mx/docs/fraud-tool.html)
* Tokenize the credit cards (https://openpay.mx/docs/openpayjs.html)

## Requirements
* npm >= 6

## Installation

### Via npm
`$ npm install openpay-react-native --save`

### Via yarn
`$ yarn add openpay-react-native`

## Usage

```js
import Openpay, {createDeviceSessionId} from 'openpay-react-native';

<Openpay 
    isProductionMode={false} 
    merchantId="YOUR_MERCHANT_ID" 
    publicKey="YOUR_PUBLIC_KEY" 
    address={address} 
    successToken={this.successToken} 
    failToken={this.failToken} 
    loading={this.state.loading}
    buttonText="Some text"
/>

// Note: address prop is optional.
```
And then on your successToken or failToken handler:

```js
state = {
    loading: false
}

successToken = (response) => {        
    const deviceSessionId = createDeviceSessionId();
    console.log('createDeviceSessionId', deviceSessionId);
    console.log('successToken', response);
    this.setState(() => ({loading: false}))
}

failToken = (response) => {
    console.log('failToken', response);
}
```

## Props
| Property | Type | Description | Required |
| --- | --- | --- | --- |
|isProductionMode | Boolean | Defines the Openpay environment| Yes |
|merchantId | String | Openpay Merchant ID | Yes |
|publicKey | String | Openpay Public Key | Yes |
|successToken | Function | It will receive the card token and here you will need to add your logic | Yes |
|failToken | Function | It will receive the error if something wrong happen | Yes |
|loading | Boolean | Adds a spinner to the button when the user clicks on it | Yes |
|address | Object | You can add the address of your customer | No |
|buttonText | String | Button's text | No |


## Methods
### createDeviceSessionId
This method creates the device session id.
```js
const deviceSessionId = createDeviceSessionId();
```

## Example
```js
import React, {Component} from 'react';
import Openpay, {createDeviceSessionId} from 'openpay-react-native';

export default class OpenpayScreen extends Component {
    state = {
        loading: false
    }

    successToken = (response) => {        
        const deviceSessionId = createDeviceSessionId();
        const token = response.id;
        this.setState(() => ({loading: false}));

        // Make the call to your server with your charge request
    }

    failToken = (response) => {
        console.log('failToken', response);
    }

    render() {
        const address = {
            "city":"Querétaro",
            "country_code":"MX",
            "postal_code":"76900",
            "line1":"Av 5 de Febrero",
            "line2":"Roble 207",
            "line3":"Col Carrillo",
            "state":"Queretaro"
        };

        return (
            <Openpay 
                isProductionMode={false} 
                merchantId="YOUR_MERCHANT_ID" 
                publicKey="YOUR_PUBLIC_KEY" 
                address={address} 
                successToken={this.successToken} 
                failToken={this.failToken} 
                loading={this.state.loading}
            />
        );
    }
}
```

## Future Improvements
* Customize credit card image
* Customize button style
* Add unit tests

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)