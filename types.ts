export enum SimulationState {
  NORMAL = 'NORMAL',
  VARICOSE = 'VARICOSE',
  THROMBUS_FORMED = 'THROMBUS_FORMED',
  DETACHING = 'DETACHING',
  DETACHED = 'DETACHED',
  POST_EMBOLISM = 'POST_EMBOLISM'
}

export interface MedicalExplanation {
  title: string;
  content: string;
  warningLevel: 'info' | 'warning' | 'critical';
}

export interface VeinProps {
  state: SimulationState;
  width: number;
  height: number;
}
