import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import * as Updates from 'expo-updates';
import AppStatusBar from './StatusBar';

export default function UpdateScreen() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    checkForOTAUpdate();
  }, []);

  const checkForOTAUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        
        const downloaded = await Updates.fetchUpdateAsync();
        setUpdateAvailable(true);
        setModalVisible(true); // show the modal when update is ready
      }
    } catch (error) {
      console.log('Update check failed:', error);
    }
  };

  const handleUpdate = async () => {
    setModalVisible(false);
    await Updates.reloadAsync(); // restart app with new update
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      transactionId: now.getTime().toString().slice(-6)
    };
  };

  const timestamp = getCurrentTimestamp();

  return (
    <View style={styles.container}>
      {/* <AppStatusBar/> */}
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.receiptContainer}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <Text style={styles.companyName}>SYSTEM UPDATE</Text>
              <Text style={styles.headerSubtext}>VERSION CONTROL</Text>
              <View style={styles.dashedLine} />
            </View>

            {/* Receipt Body */}
            <View style={styles.receiptBody}>
             
              
              <View style={styles.transactionRow}>
                <Text style={styles.receiptLabel}>DATE:</Text>
                <Text style={styles.receiptValue}>{timestamp.date}</Text>
              </View>
              
              <View style={styles.transactionRow}>
                <Text style={styles.receiptLabel}>TIME:</Text>
                <Text style={styles.receiptValue}>{timestamp.time}</Text>
              </View>

              <View style={styles.dashedLine} />

              {/* Main Item */}
              <View style={styles.itemSection}>
                <Text style={styles.itemName}>APP UPDATE AVAILABLE</Text>
                <Text style={styles.itemDescription}>NEW VERSION READY</Text>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>STATUS:</Text>
                  <Text style={styles.itemValue}>{
                  isDownloaded ?  "DOWNLOADED" : "NOT DOWNLOADED"
                  }</Text>
                </View>
                <View style={styles.itemRow}>
                  <Text style={styles.itemLabel}>ACTION:</Text>
                  <Text style={styles.itemValue}>RESTART REQ.</Text>
                </View>
              </View>

              <View style={styles.dashedLine} />

              {/* Message */}
              <View style={styles.messageSection}>
                <Text style={styles.receiptMessage}>
                  A NEW VERSION IS READY.{'\n'}
                  RESTART TO APPLY UPDATE?
                </Text>
              </View>

              <View style={styles.dashedLine} />
            </View>

            {/* Receipt Actions */}
            <View style={styles.actionsSection}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.laterButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.laterButtonText}>[ LATER ]</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.restartButton]} 
                onPress={handleUpdate}
              >
                <Text style={styles.restartButtonText}>[ RESTART NOW ]</Text>
              </TouchableOpacity>
            </View>

            {/* Receipt Footer */}
            <View style={styles.receiptFooter}>
              <Text style={styles.footerText}>THANK YOU</Text>
              <View style={styles.tearLine}>
                {Array.from({ length: 15 }).map((_, i) => (
                  <View key={i} style={styles.tearDot} />
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top:0
    // paddingTop:40
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  receiptContainer: {
    backgroundColor: '#101010',
    width: 320,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderRadius:20
  },
  receiptHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    alignItems: 'center',
  },
  companyName: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#c8c6c6',
    textAlign: 'center',
  },
  headerSubtext: {
    fontFamily: 'serif',
    fontSize: 12,
    color: '#bdbbbb',
    letterSpacing: 1,
    marginTop: 2,
  },
  receiptBody: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  receiptLabel: {
    fontFamily: 'serif',
    fontSize: 11,
    color: '#bdbbbb',
    letterSpacing: 0.5,
  },
  receiptValue: {
    fontFamily: 'serif',
    fontSize: 11,
    color: '#bdbbbb',
    fontWeight: 'bold',
  },
  itemSection: {
    marginVertical: 10,
  },
  itemName: {
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#bdbbbb',
    marginBottom: 2,
  },
  itemDescription: {
    fontFamily: 'serif',
    fontSize: 11,
    color: '#bdbbbb',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  itemLabel: {
    fontFamily: 'serif',
    fontSize: 11,
    color: '#bdbbbb',
  },
  itemValue: {
    fontFamily: 'serif',
    fontSize: 11,
    color: '#bdbbbb',
    fontWeight: 'bold',
  },
  messageSection: {
    marginVertical: 10,
    alignItems: 'center',
  },
  receiptMessage: {
    fontFamily: 'serif',
    fontSize: 12,
    color: '#bdbbbb',
    textAlign: 'center',
    lineHeight: 16,
  },
  dashedLine: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderStyle: 'dashed',
    marginVertical: 10,
    marginHorizontal: -20,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  actionButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius:20
  },
  laterButton: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    color:"black"
  },
  restartButton: {
    borderColor: '#333',
    backgroundColor: '#333',
  },
  laterButtonText: {
    fontFamily: 'serif',
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  restartButtonText: {
    fontFamily: 'serif',
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  receiptFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'serif',
    fontSize: 11,
    color: '#999',
    letterSpacing: 2,
    marginBottom: 10,
  },
  tearLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  tearDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ddd',
  },
});