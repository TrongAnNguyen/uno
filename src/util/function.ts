import { PRIZE_ORDER } from "./constants";

type Participant = {
  noRounds: number;
  cost: number;
  earn: number;
  pnl: number;
  prize: PRIZE_ORDER;
};

const ROW_TYPE = {
  PRIZE: "prize",
  PARTICIPANT: "participant",
  HISTORY: "history",
};

const COST_PER_ROUND = 2000;

function getRowType(row: string) {
  if (!row) return undefined;

  const rowData = row.split(",");

  const isPrize = rowData.every((data) => data && !isNaN(data as any));
  if (isPrize) return ROW_TYPE.PRIZE;

  const isParticipant = rowData[0].startsWith("p:");
  if (isParticipant) return ROW_TYPE.PARTICIPANT;

  const isHistory =
    typeof rowData[0] === "string" &&
    !rowData[0].startsWith("p:") &&
    rowData.length > 0;
  if (isHistory) return ROW_TYPE.HISTORY;

  return undefined;
}

function getPrize(row: string) {
  return row.split(",").map((prizeStr) => Number(prizeStr));
}

function getParticipant(row: string) {
  if (row.startsWith("p:")) {
    return row
      .slice(2)
      .split(",")
      .map((name) => name.trim());
  }

  return row.split(",").map((name) => name.trim());
}

function increasePlayedRoundOfParticipants(
  currentParticipants: string[],
  result: any
) {
  currentParticipants.forEach((participant) => {
    if (participant in result) {
      result[participant].noRounds += 1;
      result[participant].cost += COST_PER_ROUND;
    }
  });
}

export function calculateResult(str: string) {
  const data = str.split(/\r?\n/);
  let currentPrize: number[] = [];
  let currentParticipants: string[] = [];
  const result: { [key: string]: Participant } = {};

  data.forEach((row: string) => {
    const rowType = getRowType(row);

    if (rowType === ROW_TYPE.PRIZE) {
      currentPrize = getPrize(row);
    }

    if (rowType === ROW_TYPE.PARTICIPANT) {
      currentParticipants = getParticipant(row);
      currentParticipants.forEach((participant) => {
        if (!(participant in result)) {
          result[participant] = {
            noRounds: 0,
            cost: 0,
            earn: 0,
            pnl: 0,
            prize: PRIZE_ORDER.DRAW,
          };
        }
      });
    }

    if (rowType === ROW_TYPE.HISTORY) {
      increasePlayedRoundOfParticipants(currentParticipants, result);
      const winners = getParticipant(row);

      winners.map((winner, index) => {
        if (winner in result) {
          const resultWinner = result[winner];
          resultWinner.earn += currentPrize[index];
        }
      });
    }
  });

  Object.keys(result).forEach((participant) => {
    const playerResult = result[participant];
    playerResult.pnl = playerResult.earn - playerResult.cost;
    playerResult.prize =
      playerResult.pnl > 0
        ? PRIZE_ORDER.WINNER
        : playerResult.pnl < 0
        ? PRIZE_ORDER.LOSER
        : PRIZE_ORDER.DRAW;
  });

  return result;
}

export function formatAmount(strAmount: string | number) {
  const amount = Number(strAmount);
  const formatter = new Intl.NumberFormat("sg-SG", {
    maximumFractionDigits: 0,
  });

  return formatter.format(amount);
}
