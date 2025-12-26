import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function Dashboard() {
  return (
    <View style={styles.container}>
      <Text>home :`)`</Text>
    </View>
  );
}
export default Dashboard;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
