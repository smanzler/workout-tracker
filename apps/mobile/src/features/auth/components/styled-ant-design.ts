import { AntDesign } from "@expo/vector-icons";
import { withUniwind } from "uniwind";

export const StyledAntDesign = withUniwind(AntDesign, {
  color: { fromClassName: "className", styleProperty: "color" },
});
