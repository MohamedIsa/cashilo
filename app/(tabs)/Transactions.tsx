import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function Transactions() {
  return (
    <View style={styles.container}>
      <Text>transactions</Text>
    </View>
  );
}
export default Transactions;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
