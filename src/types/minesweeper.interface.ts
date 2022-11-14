export interface MineOp {
  row: number;
  col: number;
  visible: boolean;
  isMine: boolean;
  isFlag: boolean;
  mines: number;
}
