const fs = require('fs');
const path = require('path');

const FONTS = [
  {
    src: path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'),
    dest: path.join(__dirname, '../public/fonts/FontAwesome.ttf'),
  },
  {
    src: path.join(__dirname, '../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
    dest: path.join(__dirname, '../public/fonts/MaterialIcons.ttf'),
  }
];

FONTS.forEach(font => {
  fs.copyFileSync(font.src, font.dest);
  console.log(`Copied ${font.src} to ${font.dest}`);
});
