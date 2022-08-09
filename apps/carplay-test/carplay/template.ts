import {
  CarPlay,
  GridTemplate,
  PointOfInterestTemplate,
} from "react-native-carplay";

const template = new PointOfInterestTemplate({
  title: "Gas stations",
  items: [
    {
      id: "1",
      location: { latitude: 64.14205147430366, longitude: -21.938186013124866 },
      title: "Fjólugata 5",
    },
  ],
});

export default template;
