export interface DocumentViewBoxHeaderProps {
  documentIndex: number;
  documentName: string;
  numberOfDocuments: number;
  onPrevious: () => void;
  onNext: () => void;
}
