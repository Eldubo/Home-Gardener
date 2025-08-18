import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Dropdown, CheckBox} from 'react-native';

export default function PlantasScreen() {
    const [modulo, setModulo] = useState(false);
return (
    <View style={styles.separatorBottom}>
      <Text style={styles.titulo}>Agregar Planta</Text>
      <View style={styles.container}>
      <TextInput placeholder="Nombre"/>
      <CheckBox value={modulo} onValueChange={setModulo} style={styles.checkbox}/>
      <Text>Conectar a un Ambiente: {ambiente ? <DropdownMarcas ambientes={ambientes} /> : 'No hay ambientes creados'}</Text>
      <Text>Conectar a un modulo: {modulo ? <DropdownMarcas modulos={modulos} /> : 'No hay modulos cerca'}</Text>
      <TouchableOpacity style={styles.botonAgregar} onPress={() => navigation.navigate('PlantasScreen')}>
        <Text style={styles.textoBoton}>Agregar planta</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
    }