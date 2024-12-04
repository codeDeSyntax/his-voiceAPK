import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useContext,
  Suspense,
} from "react";
import { SermonContext } from "../../Logic/globalState";
import { useAppTheme } from "../../Logic/theme";
import {
  Image,
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import earlySermons from "../../sermons/1964-1969/firstset";
import secondSet from "../../sermons/1970/1970";
import thirdSet from "../../sermons/1971/1971";
import fourthSet from "../../sermons/1972/1972";
import lastSet from "../../sermons/1973/1973";
import audioSermons from "../../sermons/audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingScreen from "../../components/Loader";
import { useNavigation } from "@react-navigation/native";

const allSermons = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
  ...audioSermons,
];

const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function RecentlyOpenedSermons() {
  const { setSelectedSermon, recentlyOpened,setRecentlyOpened,theme } =
    React.useContext(SermonContext);
    // const {theme} = useAppTheme()
  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigation = useNavigation()

  const filteredSermons = recentlyOpened.filter((sermon) => {
    const matchesSearch = sermon.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesYear =
      selectedYear === "All Years" || sermon.year === selectedYear;
    const matchesLetter =
      selectedLetter === "All Letters" ||
      sermon.title.toLowerCase().startsWith(selectedLetter.toLowerCase());
    return matchesSearch && matchesYear && matchesLetter;
  });
  
  const sortedSermons = [...filteredSermons].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.title.trim().localeCompare(b.title.trim());
    } else {
      return b.title.trim().localeCompare(a.title.trim());
    }
  });


  const handleSermonClick = async (sermon) => {

    setSelectedSermon(sermon);
    navigation?.navigate("Home");

  };

  const removeFromRecents = async (item) => {
    const updatedRecents = recentlyOpened.filter((sermon) => item.id !== sermon.id);
    setRecentlyOpened(updatedRecents);
    
    try {
      // Use updatedRecents to update AsyncStorage with the correct value
      await AsyncStorage.setItem("recentlyOpenedSermons", JSON.stringify(updatedRecents));
      console.log(recentlyOpened.length);
      
    } catch (error) {
      console.error("Failed to update recents in AsyncStorage", error);
    }
  };
  

  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    // Cleanup animation when the component unmounts
    return () => pulseAnimation.stop();
  }, [scaleValue]);

  const LocationNotFound = useCallback(
    () => (
      <Text style={{ fontSize: 9, color: theme.colors.ltext,fontFamily:'monospace' }}>Location not found</Text>
    ),
    []
  );

  const renderSermonItem = (
    ({ item, index }) => (
      <Pressable
      key={item.id}
        style={[
          styles.sermonItem,
          {
            borderWidth:1,
            borderColor:theme.colors.secondary,
            backgroundColor: theme.dark === true ? (parseInt(index) % 2 === 0 ? theme.colors.primary : theme.colors.primary) : 'white',
            gap:10
          },
        ]}
        
      >

      <TouchableOpacity onPress={() => handleSermonClick(item)} style={{width:"90%"}} >
      <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5,
            fontSize: 12,
            width: 200,
            borderRadius: 10,
            backgroundColor:theme.colors.background,
            marginBottom:2
          }}
        >
          <Text
            style={{
              color: "#8e969c",
              fontSize: 12,
            }}
          >
            {item.date}
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            {item.type === "mp3" ? (
              <Text style={styles.animatedMicrophone}>
                {item.type === "mp3" && <FontAwesome5 name="microphone"  color={theme.dark === true  ? theme.colors.text : "gray"}/>}
              </Text>
            ) : (
             <Ionicons name= 'text' color='#fafafa'/>
            )}
          </Animated.View>
        </View>
      <Text style={[styles.sermonTitle, {color:theme.colors.text}]}>{item.title}</Text>
      <Text style={{ fontSize: 9, color: theme.colors.ltext, paddingBottom: 4,fontFamily:'monospace' }}>
          {item.location ? item.location : <LocationNotFound />}
        </Text>
       
      </TouchableOpacity>
     <TouchableOpacity style={{alignSelf:''}} onPress={() => removeFromRecents(item)}>
     <FontAwesome name="trash" size={25} color={theme.dark === true  ? theme.colors.text : "gray"} />
     </TouchableOpacity>
      </Pressable>
    )
  );

  const closeDropdown = useCallback(() => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  }, []);

  return (
     <KeyboardAvoidingView
      style={[styles.container,  {backgroundColor:theme.colors.primary}]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.searchContainer}>
        <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
        <Text style={[styles.label, {color:theme.colors.text}]}>
          Recents</Text>
        <Image source={require("../../assets/notebook.gif")}  style={{height:30,width:30,marginVertical:20,borderRadius:100}}/>
        </View>
       {
        recentlyOpened.length > 0 &&
        <View style={[styles.searchInputContainer,  {backgroundColor:theme.dark === true ? '#3d4043' : 'white', borderWidth:!theme.dark ? 1 : 0, borderColor:'silver'}]}>
        <TextInput
          style={[styles.searchInput, {color:'gray',border:theme.dark === true ? 0 : 1, backgroundColor:theme.dark === true ? '#3d4043' : 'white'   }]}
          placeholder="Search Sermons"
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={theme.colors.text}
          selectionColor={theme.dark === true  ? theme.colors.text : "gray"}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            /* Implement search action */
          }}
        >
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
       }
      </View>

     {
      recentlyOpened.length > 0 && 
      <View style={styles.filtersContainer}>
      <TouchableOpacity
        onPress={() => setIsLetterModalVisible(true)}
        style={[styles.filterButton ,{backgroundColor:theme.dark === true ? '#22272a': 'white',shadowColor:theme.colors.text}]}
      >
        {/* <Text style={styles.filterText}>{selectedLetter}</Text> */}
        <Ionicons
          name="text-outline"
          size={16}
          color={theme.colors.text}
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsYearModalVisible(true)}
        style={[styles.filterButton ,{backgroundColor:theme.colors.background,shadowColor:theme.colors.text}]}
      >
        {/* <Text style={styles.filterText}>{selectedYear}</Text> */}
        <FontAwesome5 name="calendar-alt" color={theme.colors.text}/>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
        <FontAwesome
          name='sort'
          size={20}
          color='#fafafa'
        />
      </TouchableOpacity>
    </View>
     }

      { recentlyOpened.length > 0 ?
        <FlatList
        data={sortedSermons}
        renderItem={renderSermonItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      :
      <View style={{padding:20,justifyContent:'center',alignItems:'center',}}>
        <Text style={{color:theme.dark === true  ? theme.colors.text : "gray"}}>No sermons in recents</Text>
      </View>
      }

      {/* Year Modal */}
      <Modal
        transparent={true}
        visible={isYearModalVisible}
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
          <View style={[styles.modalContent,
            {
              backgroundColor:theme.colors.secondary
            }
          ]}>
            <FlatList
              data={years}
              renderItem={({ item ,index}) => (
                <Pressable
                  style={[styles.gridItem,{
                    elevation:3,
                    backgroundColor:
                      theme.dark 
                        ? parseInt(index) % 2 === 0
                          ? theme.colors.primary
                          : theme.colors.primary
                        : "#fafafa",
                  }]}
                  onPress={() => {
                    setSelectedYear(item);
                    closeDropdown();
                  }}
                >
                  <Text style={[styles.gridItemText,{
                    color: theme.dark === true ? theme.colors.text : "gray"
                  }]}>{item}</Text>
                </Pressable>
              )}
              numColumns={3}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.allYearsOption, {
                backgroundColor:theme.colors.primary
              }]}
              onPress={() => {
                setSelectedYear("All Years");
                closeDropdown();
              }}
            >
              <Text style={styles.gridBtnText}>All Years</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Letter Modal */}
      <Modal
        transparent={true}
        visible={isLetterModalVisible}
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.modalOverlay} onPress={closeDropdown}>
          <View style={[styles.modalContent,
            {
              backgroundColor:theme.colors.secondary
            }
          ]}>
            <FlatList
              data={alphabet}
              renderItem={({ item,index }) => (
                <Pressable
                  style={[styles.gridItem, 
                    {
                      elevation:3,
                      backgroundColor:
                        theme.dark 
                          ? parseInt(index) % 2 === 0
                            ? theme.colors.primary
                            : theme.colors.primary
                          : "#fafafa",
                    }
                  ]}
                  onPress={() => {
                    setSelectedLetter(item);
                    closeDropdown();
                  }}
                >
                  <Text style={[styles.gridItemText,{
                    color: theme.dark === true ? theme.colors.text : "gray"
                  }]}>{item}</Text>
                </Pressable>
              )}
              numColumns={5}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.gridContainer}
            />
            <Pressable
              style={[styles.allLettersOption, {
                backgroundColor:theme.colors.primary
              }]}
              onPress={() => {
                setSelectedLetter("All Letters");
                closeDropdown();
              }}
            >
              <Text style={styles.gridBtnText}>All Letters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  // ... (styles remain unchanged)
  container: {
    flex: 1,
    backgroundColor: "#2d2d2d",
    paddingTop: 40,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: "gray",
  },
  label: {
    fontSize: 24,
    fontFamily:"serif",
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor:'white',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#fafafa",
    borderRadius:8
    
    
  },
  searchButton: {
    height: 40,
    width: 40,
    // backgroundColor: "#427092",
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  filtersContainer: {
    flexDirection: "row",
    gap:10,
    // justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 5,
  },
  filterText: {
    marginRight: 8,
    fontSize: 16,
    color: "#333",
  },
  
  sortButton: {
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#427092",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 120,
    paddingTop:10
  },
  sermonItem: {
    paddingHorizontal: 12,
    paddingVertical:10,
    marginBottom: 12,
    flexDirection:'row',
    justifyContent:'center',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sermonTitle: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily:'serif',
    marginBottom: 4,
    color: "#bfc7ca",
  },
  animatedMicrophone: {},
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  gridContainer: {
    paddingVertical: 8,
  },
  gridItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedGridItem: {
    backgroundColor: "#427092",
  },
  gridItemText: {
    fontSize: 16,
    color: "#333",
  },
  selectedGridItemText: {
    color: "#fff",
  },
  allYearsOption: {
    backgroundColor: "#0a84ff",
    width: "100%",
    padding: 10,
    borderRadius: 8,
  },
  allLettersOption: {
    backgroundColor: "#0a84ff",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  gridBtnText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default RecentlyOpenedSermons;
