import ThemedTextArea from "../ThemedUserInput/ThemedTextArea";

function ChatBoxInput({
  content,
  enterPressed,
  setContent,
}: {
  content: string;
  enterPressed: () => void;
  setContent: (text: string) => void;
}) {
  return (
    <ThemedTextArea
      placeHolderText="Type here..."
      content={content}
      setContent={setContent}
      spacing="loose"
      maxLines={10}
      enterPressed={enterPressed}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={true}
    />
  );
}

export default ChatBoxInput;
