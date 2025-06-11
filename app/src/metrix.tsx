import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 375;  // iPhone X width
const guidelineBaseHeight = 812; // iPhone X height

// Get a scale factor considering both width & height (more balanced scaling)
const scaleFactor = Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);

// Scale based on width
const horizontalScale = (size) => (width / guidelineBaseWidth) * size;

// Scale based on height
const verticalScale = (size) => (height / guidelineBaseHeight) * size;

// Better moderate scaling
const moderateScale = (size, factor = 0.5) =>
  size + (size * (scaleFactor - 1) * factor);

export { horizontalScale, moderateScale, verticalScale };

const baseWidth = 375; // Reference width (iPhone X)

const scale = width / baseWidth; // Scale based on screen width
const fontSize = (size) => Math.round(size * scale * (1 / PixelRatio.getFontScale()));

export default fontSize;
