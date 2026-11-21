import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddBagScreen from './src/screens/AddBagScreen';
import BagDetailsScreen from './src/screens/BagDetailsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EditBagScreen from './src/screens/EditBagScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddBag" component={AddBagScreen} />
        <Stack.Screen name="BagDetails" component={BagDetailsScreen} />
        <Stack.Screen name="EditBag" component={EditBagScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}