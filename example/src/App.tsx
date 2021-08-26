import * as React from 'react';
import {useEffect} from 'react';
import {Alert, StyleSheet, Text, View,} from 'react-native';
import {createTokenWithCard, Openpay} from 'openpay-react-native';

export default function App() {
    const successToken = (response) => {
        console.log(response);
        Alert.alert('Tokne generado', response.id, [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
    };
    const failToken = (response) => {
        console.log(failToken);
        console.log(response);
        Alert.alert('Datos inválidos', [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
        ]);
    };

    const deviceSession = (response) => {
        console.log('deviceSession');
        console.log(response);
    };

    useEffect(() => {
        // Discomment to test tokenize with custom form
        createTokenWithCard(
            {
                holder_name: 'Nombre Prueba',
                cvv2: '111',
                expiration_month: '12',
                card_number: '424242424242424242',
                expiration_year: '25',
                isProductionMode: false,
                merchantId: 'm2tmftuv5jao96rrezj2',
                publicKey: 'pk_d5e9bff37db4468da3f80148bb94f263',
            }
        ).then((response) => {
            console.log(response);
        });
    });

    const address = {
        line1: 'Av 5 de Febrero',
        line2: 'Roble 207',
        line3: 'col carrillo',
        state: 'Queretaro',
        city: 'Querétaro',
        postal_code: '76900',
        country_code: 'MX',
    };

    return (
        <View style={styles.sectionContainer}>
            <Openpay
                isProductionMode={false}
                merchantId="m2tmftuv5jao96rrezj2"
                publicKey="pk_d5e9bff37db4468da3f80148bb94f263"
                //address={address} //optional
                successToken={successToken}
                failToken={failToken}
                deviceSession={deviceSession}
                buttonText="Pagar"
                custom={false}
                labels={
                    {
                        holder: 'Nombre completo',
                        expiration: 'FECHA'
                    }
                }
                placeholders={{
                    holder: "Nombre Apellidos",
                    number: 'xxxx xxxx **** ****',
                    expiration: 'MM/YY',
                    cvv: 'CVV',
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        paddingTop:60,
        // flexDirection: 'column',
        // justifyContent: 'center',
        // alignItems: 'center',
        // backgroundColor: 'red',
    },
    scrollView: {
        // paddingBottom : 400
    },
});
