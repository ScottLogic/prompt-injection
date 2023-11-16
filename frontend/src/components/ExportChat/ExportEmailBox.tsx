import { View, StyleSheet } from "@react-pdf/renderer";
import { Fragment } from "react";

import ExportEmailMessage from "./ExportEmailMessage";

import { EmailInfo } from "@src/models/email";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

function ExportEmailBox({ emails }: { emails: EmailInfo[] }) {
  const rows = emails.map((email, index) => (
    <View style={styles.row} key={index}>
      <ExportEmailMessage email={email} />
    </View>
  ));
  return <Fragment>{rows}</Fragment>;
}

export default ExportEmailBox;
