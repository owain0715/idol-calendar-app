`use strict`;
const date = new Date();
const weeks = ["日", "月", "火", "水", "木", "金", "土"];

const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;

const today = date.getDate(); //今日の日付を取得

let displayYear = currentYear;
let displayMonth = currentMonth;

//HTMLからID取得
const todayEl = document.getElementById("today");
const backwardBtnEl = document.getElementById("backwardBtn");
const forwardBtnEl = document.getElementById("forwardBtn");
const dayGridEl = document.getElementById("dayGrid");
const calendarEl = document.getElementById("calendarGrid");
const selectedDateTextEl = document.getElementById("selectedDateText");

const eventInputAreaEl = document.getElementById("eventInputArea");
const eventInputEl = document.getElementById("eventInput");
const saveEventBtnEl = document.getElementById("saveEventBtn");
const idolSelectEl = document.getElementById("idolSelect");
const amountInputEl = document.getElementById("amountInput");

const calendarPage = document.getElementById("calendarPage");
const idolPage = document.getElementById("idolPage");

const showCalendarBtn = document.getElementById("showCalendarBtn");
const showIdolBtn = document.getElementById("showIdolBtn");

const selectedEventsEl = document.getElementById("selectedEvents");

let selectedDate = null;
let selectedEvent = null;

//推しデータ用の配列を1つ作る
let idols = [];

calendarPage.style.display = "block";
idolPage.style.display = "none";

showCalendarBtn.addEventListener("click", () => {
  calendarPage.style.display = "block";
  idolPage.style.display = "none";
});

showIdolBtn.addEventListener("click", () => {
  calendarPage.style.display = "none";
  idolPage.style.display = "block";
});

//イベントの型
const events = [];

//localStorageからアイテムを取り出す・key : value
//"events" : "[{date:'2026-03-25',title:'アクスタ',...}]"みたいな形で
const saveEvents = localStorage.getItem("events");

//保存データが存在するときだけ
if (saveEvents) {
  //"[{...},{...}]"を[{...},{...}]に戻す(splice)
  //0番目から配列の要素分削除するためにlengthを用いる・その後入れ替える
  events.splice(0, events.length, ...JSON.parse(saveEvents));
}

function getDateKey(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-");
  return `${year}/${month}/${day}`;
}

// 推しのリスト欄作成ゾーン⬇︎
const addIdolBtnEl = document.getElementById("addIdolBtn");
const idolInputAreaEl = document.getElementById("idolInputArea");
const saveIdolBtnEl = document.getElementById("saveIdolBtn");
const idolInputEl = document.getElementById("idolInput");
const idolCardsEl = document.getElementById("idolCards");
const addIdolColorEl = document.getElementById("addIdolColor");
const deleteIdolsBtnEl = document.getElementById("deleteIdolsBtn");
const idolEventsEl = document.getElementById("idolEvents");

//保存データがあれば読み込む
const savedIdols = localStorage.getItem("idols");
//localStorage から "idols" の中身を取る
if (savedIdols) {
  //保存データがある時だけ
  idols = JSON.parse(savedIdols);
  //配列に戻すJSON.parse
}

addIdolBtnEl.addEventListener("click", () => {
  idolInputAreaEl.style.display = "block";
});

saveIdolBtnEl.addEventListener("click", () => {
  const idolName = idolInputEl.value;
  const idolColor = addIdolColorEl.value;

  //スペースだけ入力された際の登録を防ぐtrim
  if (idolName.trim() === "") {
    return;
  }
  // const div = document.createElement("div");
  // div.classList.add("idol-card");
  // div.textContent = idolName;
  // div.style.borderLeft = `6px solid ${idolColor}`;
  // idolCardsEl.append(div);

  idols.push({
    id: crypto.randomUUID(),
    name: idolName,
    color: idolColor,
  });

  localStorage.setItem("idols", JSON.stringify(idols));
  renderIdols();

  idolInputEl.value = ""; //入力後、inputを空白に戻す
  addIdolColorEl.value = "#000000"; //初期値に戻す
  idolInputAreaEl.style.display = "none"; //入力欄を閉じる
});

deleteIdolsBtnEl.addEventListener("click", () => {
  idols = []; //全て空にする
  localStorage.setItem("idols", JSON.stringify(idols));
  //localStorageの情報も再度保存する・リロードしたときに削除したものが戻ってくるのを防ぐため
  renderIdols();
});

function renderIdols() {
  idolCardsEl.innerHTML = "";
  idolSelectEl.innerHTML = "";

  idols.forEach((idol, index) => {
    const idolEvents = events.filter((event) => {
      return event.idolId === idol.id;
    });

    const total = idolEvents.reduce((sum, event) => {
      return sum + (event.amount || 0);
    }, 0);

    const div = document.createElement("div");
    div.classList.add("idol-card");
    div.style.borderLeft = `6px solid ${idol.color}`;

    div.addEventListener("click", () => {
      const idolEvents = events.filter((event) => {
        return event.idolId === idol.id;
      });

      idolEventsEl.innerHTML = "";

      if (idolEvents.length === 0) {
        const emptyText = document.createElement("div");
        emptyText.textContent = "まだ予定がありません><";
        idolEventsEl.append(emptyText);
      }

      idolEvents.forEach((event) => {
        const idol = idols.find((i) => i.id === event.idolId);

        const eventDiv = document.createElement("div");

        if (idol) {
          eventDiv.style.borderLeft = `4px solid ${idol.color}`;
        }

        eventDiv.textContent =
          formatDate(event.date) + " : " + event.title + " ¥" + event.amount;

        idolEventsEl.append(eventDiv);
      });

      console.log(idolEvents);
    });

    const option = document.createElement("option");
    option.value = idol.id;
    option.textContent = idol.name;

    idolSelectEl.append(option);

    //deleteと分けておいた方がcssで装飾しやすい
    const nameSpan = document.createElement("span");
    nameSpan.textContent = idol.name;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
      idols.splice(index, 1);
      //index番目から1個だけ削除する
      localStorage.setItem("idols", JSON.stringify(idols));
      renderIdols();
    });

    const totalDiv = document.createElement("div");
    totalDiv.textContent = "合計 ¥" + total;

    //作ったものを表示
    div.append(nameSpan);
    div.append(totalDiv);
    div.append(deleteBtn);
    idolCardsEl.append(div);
  });
}

let chart = null;

function renderChart() {
  const ctx = document.getElementById("idolChart");

  if (!ctx) return;

  const labels = [];
  const data = [];
  const colors = [];

  idols.forEach((idol) => {
    const monthKey = `${displayYear}-${String(displayMonth).padStart(2, "0")}`;

    const idolEvents = events.filter((event) => {
      return event.idolId === idol.id && event.date.startsWith(monthKey);
    });

    const total = idolEvents.reduce((sum, event) => {
      return sum + (event.amount || 0);
    }, 0);

    if (total > 0) {
      labels.push(idol.name);
      data.push(total);
      colors.push(idol.color);
    }
  });

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
        },
      ],
    },
  });
}

// 月次支出
let monthChart = null;

function renderMonthChart() {
  const ctx = document.getElementById("monthChart");
  if (!ctx) return;

  const monthTotals = {};

  events.forEach((event) => {
    const month = event.date.slice(0, 7);

    if (!monthTotals[month]) {
      monthTotals[month] = 0;
    }

    monthTotals[month] += event.amount || 0;
  });

  // 最初の月〜最後の月まで作る
  const months = Object.keys(monthTotals).sort();

  if (months.length === 0) return;

  const start = new Date(months[0] + "-01");
  const end = new Date(months[months.length - 1] + "-01");

  const labels = [];
  const data = [];

  const current = new Date(start);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const key = `${y}-${m}`;

    labels.push(`${y}年${Number(m)}月`);
    data.push(monthTotals[key] || 0);

    current.setMonth(current.getMonth() + 1);
  }

  if (monthChart) {
    monthChart.destroy();
  }

  monthChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "月別支出",
          data: data,
        },
      ],
    },
  });
}

renderIdols();
renderChart();
renderMonthChart();

//月次支出データ
function calculateMonthTotal() {
  const monthKey = `${displayYear}-${String(displayMonth).padStart(2, "0")}`;

  const monthEvents = events.filter((event) => {
    return event.date.startsWith(monthKey);
  });

  const total = monthEvents.reduce((sum, event) => {
    return sum + (event.amount || 0);
  }, 0);

  const monthTotalEl = document.getElementById("monthTotal");

  if (!monthTotalEl) return;

  monthTotalEl.textContent = `今月の支出：¥${total}`;
}

function renderCalendar() {
  const startDate = new Date(displayYear, displayMonth - 1, 1);
  //monthは人間向け表示のため+1されているため、-1して戻さなければならない
  //getMonth()は内部ルールで0始まりのため注意
  const startDay = startDate.getDay();
  //今月は何曜日から始まるか

  const endDate = new Date(displayYear, displayMonth, 0);
  //人間向けの月の0日。例：4月0日▶︎3月31日
  const endDayCount = endDate.getDate();
  //startDayCountは、毎月必ず1日スタートのため不要

  console.log(date); //確認用
  console.log(endDayCount); //確認用

  //【行いたい処理】
  //・先頭に空白を入れる
  //・1日〜月末を入れる
  //・今の数を確認する
  //・42(最大6週×7日)になるまで末尾に空白を入れる

  //今日の日付
  todayEl.textContent = `${displayYear}/${String(displayMonth).padStart(2, "0")}`;
  //padStart(目標の長さ, "埋める文字");
  //String専用・取り出した時点でmonthやtodayは数値なので、Stringで一時的に文字列として扱う

  //選択中の日付関連
  if (selectedDate) {
    selectedDateTextEl.textContent = `選択中：${formatDate(selectedDate)}`;
  } else {
    selectedDateTextEl.textContent = "日付を選択してね";
  }

  // 再描画の前に中身を空にする
  dayGridEl.innerHTML = "";
  calendarEl.innerHTML = "";

  //曜日部分の描画
  weeks.forEach((day) => {
    const cell = document.createElement("div");
    cell.classList.add("day-cell");
    cell.textContent = day;
    dayGridEl.append(cell);
  });

  //日付部分の箱を用意する
  const calendarGrid = [];

  for (let i = 0; i < startDay; i++) {
    calendarGrid.push("");
  }
  //startDayが来るまで空白を入れ込む

  for (let day = 1; day <= endDayCount; day++) {
    calendarGrid.push(day);
  }
  //1日から月末までを入れ込む。初日は必ず1だから

  const remaining = 7 - (calendarGrid.length % 7);

  //7で割って0なら空白を埋める必要はないが、余がある時追加する
  if (remaining !== 7) {
    for (let i = 0; i < remaining; i++) {
      calendarGrid.push("");
    }
  }
  //   確認用
  //   console.log(calendarGrid);
  //   console.log(calendarGrid.length);

  calendarGrid.forEach((item) => {
    const cell = document.createElement("div");
    cell.classList.add("calendar-cell");

    if (
      item === today &&
      displayYear === currentYear &&
      displayMonth === currentMonth
    ) {
      cell.classList.add("today-cell");
    }

    cell.textContent = item;

    if (item !== "") {
      const dateKey = getDateKey(displayYear, displayMonth, item);

      if (dateKey === selectedDate) {
        cell.classList.add("selected-cell");
      }

      cell.addEventListener("click", () => {
        if (item === "") return;

        selectedDate = dateKey;

        eventInputAreaEl.style.display = "block";

        // //prompt型→HTML型に変更⬇︎
        // const title = prompt("予定を入力");

        // if (!title) {
        //   //状態(state)が変わったらUIを再描画する
        //   renderCalendar();
        //   return;
        // }

        // events.push({
        //   date: dateKey,
        //   title: title,
        //   status: "planned",
        // });

        renderCalendar();
      });

      //条件に合うイベント集め
      const dayEvents = events.filter((event) => {
        return event.date === dateKey;
      });

      // if (dayEvents.length > 0) {
      //   const idol = idols[dayEvents[0].idolId];

      //   if (idol) {
      //     cell.style.borderBottom = `3px solid ${idol.color}`;
      //   }
      // }

      const eventList = document.createElement("div");
      eventList.classList.add("event-list");

      dayEvents.forEach((event) => {
        const div = document.createElement("div");
        div.classList.add("event");
        div.textContent = event.title + " ¥" + event.amount;

        const idol = idols.find((i) => i.id === event.idolId);

        if (idol) {
          div.style.borderLeft = `4px solid ${idol.color}`;
        }

        div.addEventListener("click", (e) => {
          e.stopPropagation();

          if (selectedEvent === event) {
            const index = events.indexOf(event);
            events.splice(index, 1);

            localStorage.setItem("events", JSON.stringify(events));

            selectedEvent = null;
          } else {
            selectedEvent = event;
          }
          renderCalendar();

          //confirm型廃止（2クリック削除に移行）
          // //confirmはブラウザにデフォルトで用意されている機能
          // //confirm() は true / false を返す
          // //ユーザーに確認をとる
          // const result = confirm("予定を削除しますか？><");

          // if (result === false) {
          //   return;
          // }

          // const index = events.indexOf(event);
          // events.splice(index, 1);

          // localStorage.setItem("events", JSON.stringify(events));
          // renderCalendar();
        });

        if (event === selectedEvent) {
          div.classList.add("selected-event");
        }

        eventList.append(div);
      });

      cell.append(eventList);
    }
    calendarEl.append(cell);
  });

  if (selectedDate) {
    const eventsForDay = events.filter((event) => event.date === selectedDate);

    const selectedEventsEl = document.getElementById("selectedEvents");

    if (selectedEventsEl) {
      selectedEventsEl.innerHTML = "";

      eventsForDay.forEach((event) => {
        const div = document.createElement("div");
        div.textContent = event.title + " ¥" + event.amount;
        selectedEventsEl.append(div);
      });
    }
  }

  calculateMonthTotal();
}

//   月跨ぎボタン部分(addEventListenerはfunctionの中に入れない・追加登録されるのを防ぐ)
backwardBtnEl.addEventListener("click", () => {
  displayMonth--;
  //displayMonth = displayMonth - 1;

  //1月の状態で1-0になってしまうのを防ぐため、0になったら年を跨ぐ
  if (displayMonth === 0) {
    //0月になってしまったら、12月に直す
    displayMonth = 12;
    //年を1年減らす
    displayYear--;
  }

  renderCalendar();
  renderChart();
});

forwardBtnEl.addEventListener("click", () => {
  displayMonth++;
  //displayMonth = displayMonth + 1;

  //13月は存在しないので、13月になったら1月に戻し、年に1を足す
  if (displayMonth === 13) {
    displayMonth = 1;
    displayYear++;
  }

  renderCalendar();
  renderChart();
});

renderCalendar();

saveEventBtnEl.addEventListener("click", () => {
  const title = eventInputEl.value;
  const amount = Number(amountInputEl.value);

  events.push({
    date: selectedDate,
    title: title,
    idolId: idolSelectEl.value,
    amount: amount,
    status: "planned",
  });

  localStorage.setItem("events", JSON.stringify(events));

  renderCalendar();
  renderChart();
  renderMonthChart();

  eventInputEl.value = "";
  amountInputEl.value = "";
  eventInputAreaEl.style.display = "none";
});
