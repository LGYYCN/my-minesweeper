<template>
  <el-container>
    <el-aside width="200px" class="border-r-2 flex justify-center items-center">
      <el-space direction="vertical" :size="20">
        <div>插旗数量: {{ flags }}</div>

        <el-input-number
          v-model="mineCount"
          :max="rowCount * colCount * 0.5"
          min="1"
        />
        <el-input-number v-model="rowCount" max="100" />
        <el-input-number v-model="colCount" max="100" />

        <el-button type="primary" @click="refresh">
          {{ gameState === GameState.Start ? "刷新" : "开始游戏" }}
        </el-button>
      </el-space>
    </el-aside>
    <el-main>
      <el-empty
        description="description"
        :image-size="200"
        v-if="gameState === GameState.End"
      >
      </el-empty>
      <div v-else class="flex justify-center items-center">
        <div class="border p-0.5">
          <div class="row flex" v-for="(row, i) in minesMap" :key="i">
            <div class="col" v-for="(col, j) in row" :key="j">
              <div
                @click="onClick(col)"
                @click.right.prevent="setFlag(col)"
                class="m-0.5 w-8 h-8 cursor-pointer"
                :class="{
                  'hover:animate-pulse': !col.visible && !col.isFlag,
                  'bg-slate-400': !col.visible && !col.isFlag,
                  'bg-green-200': col.isFlag && !col.visible,
                }"
              >
                <span
                  v-if="col.visible"
                  class="w-8 h-8 flex justify-center items-center"
                  :class="
                    col.isMine
                      ? 'bg-red-200'
                      : col.mines === MINE_NULL
                      ? 'bg-slate-100'
                      : 'bg-slate-200'
                  "
                >
                  {{
                    !col.visible || col.isMine || col.mines === 0
                      ? ""
                      : col.mines
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { GameState } from "@/types/minesweeper.enum";
import type { MineOp } from "@/types/minesweeper.interface";
import { computed, reactive, ref, type Ref } from "vue";

const MINE_NULL = 0;

const mineCount = ref(5);
const rowCount = ref(20);
const colCount = ref(20);

const getMines = (
  minesCount: number = 10,
  total: number = 100
): Set<number> => {
  let res: Set<number> = new Set();
  do {
    let mineNum = Math.floor(Math.random() * total);
    res.add(mineNum);
  } while (res.size < minesCount);
  return res;
};

let getMinesCube = (row: number, col: number): MineOp[][] => {
  let res: MineOp[][] = [];
  for (let i = 0; i < row; i++) {
    res[i] = [];
    for (let j = 0; j < col; j++) {
      let isMine = mines.value.has(i * row + j);
      let mineCount = getMineCount(i, j, row, col, mines.value);
      res[i][j] = {
        row: i,
        col: j,
        isMine,
        visible: false,
        isFlag: false,
        mines: mineCount,
      };
    }
  }
  return res;
};

let getAroundPoint = (
  row: number,
  col: number,
  rowCount: number,
  colCount: number
): [number, number][] => {
  let list: [number, number][] = [
    [row - 1, col - 1],
    [row - 1, col],
    [row - 1, col + 1],
    [row, col - 1],
    [row, col + 1],
    [row + 1, col - 1],
    [row + 1, col],
    [row + 1, col + 1],
  ];
  let res: [number, number][] = list.filter(([r, c]) => {
    return r >= 0 && r < rowCount && c >= 0 && c < colCount;
  });
  return res;
};

let getMineCount = (
  row: number,
  col: number,
  rowCount: number,
  colCount: number,
  mines: Set<number>
): number => {
  let list = getAroundPoint(row, col, rowCount, colCount);
  let count = 0;
  list.forEach(([r, c]) => {
    if (mines.has(r * rowCount + c)) {
      count++;
    }
  });
  return count;
};

/** 地雷的定位 */
let mines: Ref<Set<number>> = ref(new Set([]));
/** 地图 */
let minesMap: MineOp[][] = reactive([]);
/** 游戏状态 */
let gameState: Ref<GameState> = ref(GameState.End);
/** 插旗数量 */
let flags = computed(() => {
  let count = minesMap.flat().filter((item) => item.isFlag).length;
  return count;
});

let refresh = () => {
  gameState.value = GameState.Start;
  mines.value = getMines(mineCount.value, rowCount.value * colCount.value);
  minesMap.length = 0;
  minesMap.push(...getMinesCube(rowCount.value, colCount.value));
};

const onClick = (cell: MineOp) => {
  if (!cell.visible && !cell.isFlag && gameState.value === GameState.Start) {
    cell.visible = true;
    if (cell.isMine) {
      gameState.value = GameState.End;
      setTimeout(() => {
        let res = confirm("End! Restart?");
        if (res) {
          refresh();
        } else {
          minesMap.forEach((row) => {
            row.forEach((col) => {
              col.visible = true;
            });
          });
        }
      }, 50);
    } else if (cell.mines === MINE_NULL) {
      let list = getAroundPoint(
        cell.row,
        cell.col,
        rowCount.value,
        colCount.value
      );
      list.forEach(([r, c]) => {
        onClick(minesMap[r][c]);
      });
    }

    let t = mineCount.value;
    minesMap.flat().forEach((item) => {
      if (!item.visible) {
        t--;
      }
    });
    if (t === 0 && gameState.value === GameState.Start) {
      gameState.value = GameState.End;
      setTimeout(() => {
        alert("Victory!");
      }, 50);
    }
  }
};

const setFlag = (cell: MineOp) => {
  cell.isFlag = !cell.isFlag;
};
</script>

<style scoped></style>
