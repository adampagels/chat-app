//import react component
import React, { Component } from 'react';
//import relevant components from react native
import 
{  StyleSheet,
  ImageBackground,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  Button,
  View,
  Platform,
  NetInfo,
  AsyncStorage } 
  from 'react-native';
// import gifted chat
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
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
    
    this.referenceMessageUser = null;
    this.referenceMessages = firebase.firestore().collection('messages')
    this.state = {
      messages: [],
      uid: 0,
      isConnected: false,
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
    };
  }
  //this will put the users name in navigation bar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name
    };
  };
  get user() {
    return {
      name: this.props.navigation.state.params.name,
      _id: this.state.uid,
      id: this.state.uid,
    }
  }
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach(doc => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
      messages
    });
  };
  addMessage() {
    console.log(this.state.user)
      this.referenceMessages.add({
        _id: this.state.messages[0]._id,
        text: this.state.messages[0].text || '',
        createdAt: this.state.messages[0].createdAt,
        user: this.state.user,
        uid: this.state.uid,
    });
  }
  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages)
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      }
    );
  }
// async functions
  getMessages = async () => {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error){
      console.log(error.message);
    }
  };
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }
  deleteMessage = async () => {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    // listen to authentication events
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected == true) {
        console.log('online');
        this.setState({
          isConnected: true,
        })
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async user => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }
          //update user state with currently active user data
          this.setState({
            uid: user.uid,
            user: {
              _id: user.uid,
              name: this.props.navigation.state.params.name,
              avatar: '',
            },
            loggedInText: "Hello there"
          });
      // create a reference to the active user's documents (messages)
        this.referenceMessageUser = firebase.firestore().collection("messages");
        // listen for collection changes for current user
        this.unsubscribeMessageUser = this.referenceMessageUser.onSnapshot(this.onCollectionUpdate);
      });
    } else {
      console.log('offline');
      this.setState({
        isConnected: false,
      });
      this.getMessages();
    }
  })
  }
  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeMessageUser();
  }
  //Gifted Chat functions
  renderInputToolbar(props){
    if (this.state.isConnected == false){
    } else {
      return (
        <InputToolbar
          {...props}
        />
      )
    }
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: this.props.navigation.state.params.color
        }}
      >
        <GiftedChat
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
        />
        {Platform.OS === "android" ? <KeyboardSpacer /> : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: "100%"
  }
});