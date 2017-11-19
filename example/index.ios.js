'use strict';
import React, {
  Component
} from 'react';

import {
  AlertIOS,
  AppRegistry,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Video from 'react-native-video';

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.onLoad = this.onLoad.bind(this);
    this.onProgress = this.onProgress.bind(this);
    this.onBuffer = this.onBuffer.bind(this);
  }
  state = {
    rate: 1,
    volume: 1,
    muted: false,
    resizeMode: 'contain',
    duration: 0.0,
    currentTime: 0.0,
    controls: false,
    paused: true,
    skin: 'custom',
    ignoreSilentSwitch: null,
    isBuffering: false,
  };

  onLoad(data) {
    console.log('On load fired!');
    this.setState({duration: data.duration});
  }

  onProgress(data) {
    this.setState({currentTime: data.currentTime});
  }

  onBuffer({ isBuffering }: { isBuffering: boolean }) {
    this.setState({ isBuffering });
  }

  getCurrentTimePercentage() {
    return this.state.currentTime <= 0 ? 0 :
      parseFloat(this.state.currentTime) / parseFloat(this.state.duration)
  }

  renderSkinControl (skin) {
    return <Toggle
      title={skin}
      isSelected={this.state.skin == skin}
      onPress={()=> this.setState({
        controls: skin == 'native' || skin == 'embed',
        skin,
      })}
    />
  }

  get renderRateControl () {
    return getToggle({self: this, field: 'rate', stringifyTitle: t=> t+'x'})
  }

  get renderResizeModeControl () {
    return getToggle({self: this, field: 'resizeMode'})
  }

  get renderVolumeControl () {
    return getToggle({self: this, field: 'volume', stringifyTitle: t=> t*100+'%'})
  }

  get renderIgnoreSilentSwitchControl () {
    return getToggle({self: this, field: 'ignoreSilentSwitch'})
  }

  get Controls () {
    return ({children})=> <View style={styles.controls}>
      <View style={styles.generalControls}>
        <View style={styles.skinControl}>
          {this.renderSkinControl('custom')}
          {this.renderSkinControl('native')}
          {this.renderSkinControl('embed')}
        </View>
      </View>
      <View style={styles.generalControls}>
        <View style={styles.rateControl}>
          {this.renderRateControl(0.5)}
          {this.renderRateControl(1.0)}
          {this.renderRateControl(2.0)}
        </View>

        <View style={styles.volumeControl}>
          {this.renderVolumeControl(0.5)}
          {this.renderVolumeControl(1)}
          {this.renderVolumeControl(1.5)}
        </View>

        <View style={styles.resizeModeControl}>
          {this.renderResizeModeControl('cover')}
          {this.renderResizeModeControl('contain')}
          {this.renderResizeModeControl('stretch')}
        </View>
      </View>
      <View style={styles.generalControls}>
        {
          Platform.OS !== 'ios' ? null:
            <View style={styles.ignoreSilentSwitchControl}>
              {this.renderIgnoreSilentSwitchControl('ignore')}
              {this.renderIgnoreSilentSwitchControl('obey')}
            </View>
        }
        <View style={styles.ignoreSilentSwitchControl}>
          <Toggle
            title={'goFullscreen'}
            isSelected={false}
            onPress={()=> this.video.presentFullscreenPlayer()}
          />
          <Toggle
            title={'seek 10'}
            isSelected={false}
            onPress={()=> this.video.seek(10)}
          />
        </View>
      </View>
      {children}
    </View>
  }

  renderVideo (props) {
    return <Video
      ref={ref=> this.video = ref}
      source={require('./broadchurch.mp4')}
      rate={this.state.rate}
      paused={this.state.paused}
      volume={this.state.volume}
      muted={this.state.muted}
      ignoreSilentSwitch={this.state.ignoreSilentSwitch}
      resizeMode={this.state.resizeMode}
      onLoad={this.onLoad}
      onBuffer={this.onBuffer}
      onProgress={this.onProgress}
      onEnd={() => { AlertIOS.alert('Done!') }}
      repeat={true}
      {...props}
    />
  }

  componentDidMount() {
    // setTimeout(()=> this.video.presentFullscreenPlayer(), 4000)
  }

  renderCustomSkin() {
    const {Controls} = this
    const flexCompleted = this.getCurrentTimePercentage() * 100;
    const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;

    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.fullScreen} onPress={() => {this.setState({paused: !this.state.paused})}}>
          {this.renderVideo({
            style: styles.fullScreen,
          })}
        </TouchableOpacity>
        <Controls>
          <View style={styles.trackingControls}>
            <View style={styles.progress}>
              <View style={[styles.innerProgressCompleted, {flex: flexCompleted}]} />
              <View style={[styles.innerProgressRemaining, {flex: flexRemaining}]} />
            </View>
          </View>
        </Controls>
      </View>
    );
  }

  renderNativeSkin() {
    const videoStyle = this.state.skin == 'embed' ? styles.nativeVideoControls : styles.fullScreen;
    return (
      <View style={styles.container}>
        <View style={styles.fullScreen}>
          {this.renderVideo({
            style: videoStyle,
            controls: this.state.controls,
          })}
        </View>
        <Controls/>
      </View>
    );
  }

  render() {
    return this.state.controls ? this.renderNativeSkin() : this.renderCustomSkin();
  }
}


const Toggle = ({isSelected, onPress, title})=> <TouchableOpacity onPress={onPress}>
  <Text style={[styles.controlOption, {fontWeight: isSelected? "bold" : "normal"}]}>
    {title}
  </Text>
</TouchableOpacity>

const getToggle = ({field, stringifyTitle = t=> t, self})=> value=> <Toggle
  title={stringifyTitle(value)}
  isSelected={self.state[field] == value}
  onPress={()=> self.setState({[field]: value})}
/>


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  controls: {
    backgroundColor: "transparent",
    borderRadius: 5,
    position: 'absolute',
    bottom: 44,
    left: 4,
    right: 4,
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  innerProgressCompleted: {
    height: 20,
    backgroundColor: '#cccccc',
  },
  innerProgressRemaining: {
    height: 20,
    backgroundColor: '#2C2C2C',
  },
  generalControls: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  skinControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rateControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  volumeControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resizeModeControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ignoreSilentSwitchControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlOption: {
    alignSelf: 'center',
    fontSize: 11,
    color: "white",
    paddingLeft: 2,
    paddingRight: 2,
    lineHeight: 12,
  },
  nativeVideoControls: {
    top: 184,
    height: 300
  }
});

AppRegistry.registerComponent('VideoPlayer', () => VideoPlayer);
