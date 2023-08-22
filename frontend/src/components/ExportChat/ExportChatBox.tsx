import React, { Fragment } from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { ChatMessage } from "../../models/chat";
import ExportChatMessage from "./ExportChatMessage";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

const ExportChatBox = ({ items }: { items: ChatMessage[] }) => {
  const rows = items.map((item, index) => (
    <View style={styles.row} key={index}>
      <ExportChatMessage message={item} />
    </View>
  ));
  return <Fragment>{rows}</Fragment>;
};

export default ExportChatBox;
