# openpay-react-native

Openpay

## Installation

```sh
npm install openpay-react-native
```

## Usage

```js
import OpenpayReactNative from "openpay-react-native";

// ...

<Openpay
  isProductionMode={false}
  merchantId="m2tmftuv5jao96rrezj2"
  publicKey="pk_d5e9bff37db4468da3f80148bb94f263"
  //address={address} //optional
  successToken={successToken}
  failToken={failToken}
  loading={loading}
  deviceSession={deviceSession}
  buttonText="Pagar"
  custom={false}
/>

See the example project to findout how to use the library
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
