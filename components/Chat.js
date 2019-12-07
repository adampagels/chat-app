//import react component
import React, { Component } from 'react';
//import relevant components from react native
import { StyleSheet, Text, View, Platform } from 'react-native';
// import gifted chat
import { GiftedChat } from 'react-native-gifted-chat';
//import keyboardspacer
import KeyboardSpacer from 'react-native-keyboard-spacer';
//import firebase
const firebase = require('firebase');
require('firebase/firestore');
// create Screen2 (Chat) class
export default class Chat extends Component {
  constructor() {
    super();
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyACDHYIK3Srk7Hac05jjTKnEVXQuiz1-vI",
        authDomain: "chatapp-9525f.firebaseapp.com",
        databaseURL: "https://chatapp-9525f.firebaseio.com",
        projectId: "chatapp-9525f",
        storageBucket: "chatapp-9525f.appspot.com",
        messagingSenderId: "322173142591",
        appId: "1:322173142591:web:d38c70b160f8387ec71a8a",
        measurementId: "G-THFK4N3PCL"
      });
    }
    this.state = {
      messages: [],
      uid: 0
    };
    this.referenceChatMessages = firebase.firestore().collection('messages');
  }

  componentDidMount() {
    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user.uid,
        messages: []
      });
      this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
    });
}

  componentWillUnmount() {
    this.unsubscribe();
  };

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user
      });
    });
  };

  addMessage() {
    const message = this.state.messages[0];
    this.referenceChatMessages.add({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      uid: this.state.uid,
      user: message.user
    });
  }
  //define title in navigation bar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.userName,
    };
  };
  //appending new message to messages object
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessage();
    });
  }
  //render components
  render() {
    return (
      //fullscreen component
      <View style={{ flex:1, backgroundColor: this.props.navigation.state.params.backgroundColor }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={
            {_Id:this.state.uid}
          }
        />
        {Platform.OS === 'android' ? <KeyboardSpacer /> : null }
      </View>
    );
  }
};
const styles = StyleSheet.create({
});