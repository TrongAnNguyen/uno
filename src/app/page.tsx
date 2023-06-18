"use client";

import { calculateResult, formatAmount } from "@/util/function";
import { Button, Input, Table } from "antd";
import clsx from "clsx";
import Lottie from "lottie-react";
import { useState } from "react";
import { data18June23 } from "@/assets/data";
import { PRIZE_ORDER, inputHistoryPlaceholder } from "@/util/constants";
import slothDoingMeditationIcon from "@/assets/icons/slothDoingMeditationIcon.json";
import trophyIcon from "@/assets/icons/trophyIcon.json";
import confettiIcon from "@/assets/icons/confettiIcon.json";
import cryingSmoothymonIcon from "@/assets/icons/cryingSmoothymonIcon.json";

const { TextArea } = Input;

export default function Home() {
  const initialData = data18June23;
  const [rawData, setRawData] = useState<string>(initialData);
  const [columns, setColumns] = useState<any>(() => {
    const result = calculateResult(initialData);
    return getColumns(result);
  });
  const [dataSource, setDataSource] = useState<any>(() => {
    const result = calculateResult(initialData);

    return getDataSource(result);
  });

  function renderPrizeIcon(type: PRIZE_ORDER) {
    if (type === PRIZE_ORDER.WINNER) {
      return (
        <>
          <Lottie className="w-[50px]" animationData={trophyIcon} />
          <Lottie
            className="absolute w-full -top-4 left-0"
            animationData={confettiIcon}
          />
        </>
      );
    } else if (type === PRIZE_ORDER.LOSER) {
      return (
        <>
          <Lottie className="w-[40px]" animationData={cryingSmoothymonIcon} />
        </>
      );
    } else {
      return (
        <>
          <Lottie
            className="w-[40px]"
            animationData={slothDoingMeditationIcon}
          />
        </>
      );
    }
  }

  function getColumns(result: any) {
    const cols = Object.keys(result).map((name) => ({
      title: (
        <div className="relative text-center text-[15px] flex flex-row items-center">
          {name}
          {renderPrizeIcon(result[name].prize)}
        </div>
      ),
      dataIndex: name,
      align: "right",
      render: (text: string, _: any, index: number) => {
        if (index === 0) {
          return (
            <span className="text-green-400 text-right font-medium">
              {formatAmount(text)}
            </span>
          );
        } else if (index === 2) {
          return (
            <span className="text-right font-medium">{formatAmount(text)}</span>
          );
        } else if (index === 3) {
          const amount = Number(text);
          return (
            <span
              className={clsx(
                {
                  "text-green-400": amount > 0,
                  "text-red-400": amount < 0,
                },
                "text-right"
              )}
            >
              <b>{formatAmount(text)}</b>
            </span>
          );
        }

        return <span className="text-right font-medium">{text}</span>;
      },
    }));

    return [
      {
        title: "",
        dataIndex: "key",
        className: "text-[15px] font-semibold",
      },
      ...cols,
    ];
  }

  function getDataSource(result: any) {
    const keys = [
      { label: "", dataIdx: "earn" as const },
      { label: "No. Rounds", dataIdx: "noRounds" as const },
      { label: "", dataIdx: "cost" as const },
      { label: "Total", dataIdx: "pnl" as const },
    ];
    const dataSource = keys.map((key) => {
      return Object.keys(result).reduce(
        (acc: any, currName: string) => {
          acc[currName] = result[currName][key.dataIdx];
          return acc;
        },
        { key: key.label }
      );
    });

    return dataSource;
  }

  const onCalculate = () => {
    const result = calculateResult(rawData);

    setColumns(getColumns(result));
    setDataSource(getDataSource(result));
  };

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1 className="text-center font-semibold text-xl sm:text-2xl md:text-3xl uppercase mb-6">
        Uno ao làng mở rộng
      </h1>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4">
        <div className="flex flex-col flex-grow max-w-[300px]">
          <div className="flex flex-col pb-4">
            <label htmlFor="historyInput" className="pb-2 font-medium">
              History
            </label>
            <TextArea
              id="historyInput"
              value={rawData}
              rows={6}
              placeholder={inputHistoryPlaceholder}
              onChange={(event) => setRawData(event.target.value)}
            />
          </div>
          <Button
            type="primary"
            className="w-fit bg-blue-600"
            onClick={onCalculate}
          >
            Calculate result
          </Button>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="pb-2 font-medium">Result</div>
          <Table
            columns={columns}
            dataSource={dataSource}
            bordered
            pagination={false}
            className="w-fit min-w-[60%] scrollbar-hide overflow-x-scroll"
            rowClassName={() => "custom-border-color"}
          />

          <div className="flex flex-col mt-6">
            <div className="italic">* Round: {formatAmount(2000)}</div>
          </div>
        </div>
      </div>
    </main>
  );
}
