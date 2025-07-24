// Add this import at top
import { Ionicons } from '@expo/vector-icons';

// Add this in HomeScreen component, before return statement
const navigation = useNavigation();

// Add this floating button before </SafeAreaView> closing tag
{/* Floating Action Button */}
<TouchableOpacity 
  style={styles.fab}
  onPress={() => navigation.navigate('CreatePost')}
>
  <Ionicons name="add" size={28} color={colors.white} />
</TouchableOpacity>

// Add these styles to StyleSheet
fab: {
  position: 'absolute',
  bottom: 30,
  right: 20,
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
},
