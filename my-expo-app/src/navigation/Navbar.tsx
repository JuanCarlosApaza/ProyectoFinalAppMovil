import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Home, Search, Disc3, Library, User } from "lucide-react-native";

const Navbar = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const activeTab = route.name;

    const handleNavigation = (screenName: string) => {
        navigation.navigate(screenName);
    };

    
    const activeColor = "#22d3ee"; 
    const inactiveColor = "#64748b"; 

    return (
        <View className="absolute bottom-0 left-0 right-0 bg-slate-950/98 border-t border-slate-800">
            <View className="flex-row items-center justify-around px-2 py-3 pb-8">
                
                {/* Home */}
                <TouchableOpacity 
                    onPress={() => handleNavigation('Inicio')}
                    className="items-center flex-1"
                >
                    <View className={`w-10 h-10 items-center justify-center rounded-xl ${activeTab === 'Inicio' ? 'bg-cyan-500/20' : ''}`}>
                        <Home color={activeTab === 'Inicio' ? activeColor : inactiveColor} size={24} />
                    </View>
                    <Text className={`text-[10px] font-semibold mt-1 ${activeTab === 'Inicio' ? 'text-cyan-400' : 'text-slate-500'}`}>
                        Inicio
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleNavigation('Buscar')}
                    className="items-center flex-1"
                >
                    <View className={`w-10 h-10 items-center justify-center rounded-xl ${activeTab === 'Buscar' ? 'bg-cyan-500/20' : ''}`}>
                        <Search color={activeTab === 'Buscar' ? activeColor : inactiveColor} size={24} />
                    </View>
                    <Text className={`text-[10px] font-semibold mt-1 ${activeTab === 'Buscar' ? 'text-cyan-400' : 'text-slate-500'}`}>
                        Buscar
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleNavigation('Segundo')}
                    className="items-center flex-1 -mt-8"
                >
                    <View className="w-14 h-14 bg-cyan-500 rounded-full items-center justify-center shadow-lg border-4 border-slate-950">
                        <Disc3 color="#000" size={28} strokeWidth={2.5} />
                    </View>
                    <Text className="text-cyan-400 text-[10px] font-bold mt-1">Escuchar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleNavigation('Biblioteca')}
                    className="items-center flex-1"
                >
                    <View className={`w-10 h-10 items-center justify-center rounded-xl ${activeTab === 'Biblioteca' ? 'bg-cyan-500/20' : ''}`}>
                        <Library color={activeTab === 'Biblioteca' ? activeColor : inactiveColor} size={24} />
                    </View>
                    <Text className={`text-[10px] font-semibold mt-1 ${activeTab === 'Biblioteca' ? 'text-cyan-400' : 'text-slate-500'}`}>
                        Librería
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleNavigation('Perfil')}
                    className="items-center flex-1"
                >
                    <View className={`w-10 h-10 items-center justify-center rounded-xl ${activeTab === 'Perfil' ? 'bg-cyan-500/20' : ''}`}>
                        <User color={activeTab === 'Perfil' ? activeColor : inactiveColor} size={24} />
                    </View>
                    <Text className={`text-[10px] font-semibold mt-1 ${activeTab === 'Perfil' ? 'text-cyan-400' : 'text-slate-500'}`}>
                        Perfil
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

export default Navbar;