const { data5 } = require("./data");

type Participant = {
  noRounds: number;
  cost: number;
  earn: number;
  pnl: number;
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

  const isPrize =
    rowData.length === 3 && rowData.some((data) => data && !isNaN(data as any));
  if (isPrize) return ROW_TYPE.PRIZE;

  const isParticipant = rowData[0].startsWith("p:");
  if (isParticipant) return ROW_TYPE.PARTICIPANT;

  const isHistory = rowData.length === 3;
  if (isHistory) return ROW_TYPE.HISTORY;

  return undefined;
}

function getPrize(row: string) {
  return row.split(",").map((prizeStr) => Number(prizeStr));
}

function getParticipant(row: string) {
  if (row.startsWith("p:")) {
    return row.slice(2).split(",");
  }

  return row.split(",");
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

function calculateResult(str: string) {
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
  });

  return result;
}

const result = calculateResult(data5);
console.log(result);
