"use client";

import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import './globals.css';

export default function Home() {
  const [medications, setMedications] = useState<string[]>([]);
  const [isAddingMedication, setIsAddingMedication] = useState<boolean>(false);
  const [medicationType, setMedicationType] = useState<string>("");
  const [customTime, setCustomTime] = useState<string>("");
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const handleAddMedication = () => {
    setIsAddingMedication(true);
  };

  const handleSubmitMedication = () => {
    if (medicationType && isValidTime(customTime)) {
      const newMedication = `${medicationType} - ${customTime}`;
      setMedications((prev) => [...prev, newMedication]);
      setIsAddingMedication(false);
      setMedicationType("");
      setCustomTime("");
      startAlarm(customTime);
    } else {
      alert("올바른 시간 형식 (HH:MM)을 입력해주세요.");
    }
  };

  const handleDeleteMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const isValidTime = (time: string) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const digits = value.replace(/\D/g, '');
    let formattedTime = digits;

    if (digits.length > 2) {
      formattedTime = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }

    setCustomTime(formattedTime);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitMedication();
    }
  };

  const startAlarm = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const alarmTime = new Date(now.setHours(hours, minutes, 0, 0));

    if (alarmTime < new Date()) {
      alarmTime.setDate(alarmTime.getDate() + 1); // 시간이 지났다면 다음 날로 설정
    }

    const timeUntilFirstAlarm = alarmTime.getTime() - new Date().getTime();
    const interval = setInterval(() => {
      alert("약을 복용하세요");
    }, 20 * 60 * 1000); // 20분마다 알람

    // 첫 번째 알람을 위한 타이머 설정
    setTimeout(() => {
      alert("약을 복용하세요.");
      setIntervalId(interval); // 알람 ID 저장
    }, timeUntilFirstAlarm);
  };

  const handleMedicationDone = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      alert("알람을 더 이상 보내지 않습니다."); // 메시지 추가

      // 공유할 메시지 설정
      const shareData = {
        title: '약 복용 완료',
        text: '약을 복용했습니다!',
        url: window.location.href // 현재 페이지 URL 공유
      };

      // 공유 기능 호출
      navigator.share(shareData)
        .then(() => {
          console.log('공유 성공');
        })
        .catch((error) => {
          console.error('공유 실패:', error);
        });
    }
  };

  return (
    <main className="main">
      <div className="topBar">
        <button className="button" onClick={handleMedicationDone}>복용 완료</button>
        <h1 className="title">복약 알리미</h1>
        <button className="button" onClick={handleAddMedication}>
          약 추가
        </button>
      </div>
      {isAddingMedication && (
        <div className="medicationForm">
          <input
            type="text"
            placeholder="약의 종류 입력"
            value={medicationType}
            onChange={(e) => setMedicationType(e.target.value)}
            className="medicationInput"
          />
          <div className="instructionBar">
            알람 시작 시간을 입력하세요. (형식: HH:MM)
          </div>
          <div className="timeInputWrapper">
            <input
              type="text"
              placeholder="HH:MM"
              value={customTime}
              onChange={handleTimeChange}
              onKeyDown={handleKeyDown}
              className="timeInput"
            />
          </div>
          <button className="button" onClick={handleSubmitMedication}>저장</button>
        </div>
      )}
      <div className="medicationList">
        {medications.map((med, index) => (
          <div key={index} className="medicationItem">
            <span>{med}</span>
            <button className="deleteButton" onClick={() => handleDeleteMedication(index)}>삭제</button>
          </div>
        ))}
      </div>
    </main>
  );
}