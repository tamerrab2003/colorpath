// src/components/UI/Modal.tsx

import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose?: () => void; // Optional close function for backdrop press or close button
  children: ReactNode;
  title?: string;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  title,
  containerStyle,
  contentStyle,
  titleStyle,
}) => {
  return (
    <RNModal
      animationType="fade" // Or "slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // For Android back button
    >
      <TouchableOpacity
        style={[styles.backdrop, containerStyle]}
        activeOpacity={1}
        onPress={onClose} // Close on backdrop press
      >
        <TouchableOpacity
          style={[styles.modalContent, contentStyle]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
        >
          {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    width: '80%', // Adjust width as needed
    maxHeight: '80%', // Adjust height as needed
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default Modal;

