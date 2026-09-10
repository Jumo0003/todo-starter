"use strict";

const task_input = document.querySelector(".task_text");
const createTask_btn = document.querySelector(".create_task");
const todo_ul = document.querySelector(".tasks");
const done_ul = document.querySelector(".done_tasks");
let task_arr = [];
const task_date = document.querySelector(".task_date");
const task_out = document.querySelector(".isOutdoor");
const modal = document.querySelector(".task_modal");
const open_modal = document.querySelector(".open_modal");
const close_modal = document.querySelector(".close_btn");
const fejlBesked = document.querySelector(".fejl");
const theme_btn = document.querySelector(".theme_btn");
createTask_btn.addEventListener("click", createTask);
open_modal.addEventListener("click", () => {
  modal.showModal();
});
close_modal.addEventListener("click", () => {
  modal.close();
});

/*******lighth dark mode  */

function setTema(vardi) {
  document.documentElement.setAttribute("data-theme", vardi);
  localStorage.setItem("tema", vardi);
}
theme_btn.addEventListener("click", () => {
  const detdervar = document.documentElement.getAttribute("data-theme");
  const nyVaerdi = detdervar === "dark" ? "light" : "dark";
  setTema(nyVaerdi);
});

async function createTask() {
  console.log("HEJ VERDEN!");
  if (!task_input.value.trim()) {
    fejlBesked.textContent = "please add a task";
    return;
  }
  const task_obj = { outside: task_out.checked, taskDate: task_date.value, taskTxt: task_input.value, taskDone: false, id: self.crypto.randomUUID() };

  task_arr.push(task_obj);
  task_obj.rain = await hentVejret(task_obj.taskDate);
  console.log("task_arr", task_arr);
  task_out.checked = false;
  task_date.value = "";
  task_input.value = "";
  modal.close();
  renderList();
  console.log(task_date);
}

function renderList() {
  todo_ul.innerHTML = "";
  done_ul.innerHTML = "";

  task_arr.forEach((task) => {
    const li = document.createElement("li");
    const kanIkkeUdfoeres = task.outside && task.rain > 0.3;
    console.log(task.taskTxt, task.outside, task.rain, kanIkkeUdfoeres);

    li.innerHTML = `<input type="checkbox" ${task.taskDone ? "checked" : ""}/>
    <p>${task.taskTxt} </p><p>${task.outside ? "🌳 Udendørs" : ""}${kanIkkeUdfoeres ? `🔺 ${task.rain} mm regn` : ""}</p><button class="delete_btn">X</button>`;
    const dltKnap = li.querySelector(".delete_btn");
    dltKnap.addEventListener("click", () => {
      const index = task_arr.indexOf(task);
      task_arr.splice(index, 1);
      renderList();
    });

    const checkBox = li.querySelector('[type = "checkbox"]');

    checkBox.addEventListener("click", (e) => {
      e.preventDefault();

      task.taskDone = !task.taskDone;
      renderList();
      console.log(task_arr);
    });
    if (task.taskDone) {
      done_ul.appendChild(li);
    } else {
      todo_ul.appendChild(li);
    }
  });
  gem();
}

async function hentVejret(dato) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=55.68&longitude=12.57&daily=precipitation_sum&timezone=Europe/Copenhagen&start_date=${dato}&end_date=${dato}`;
  const svar = await fetch(url);
  const data = await svar.json();
  if (data.error) {
    return null;
  } else return data.daily.precipitation_sum[0];
}

function gem() {
  localStorage.setItem("assigments", JSON.stringify(task_arr));
}

async function hentGemte() {
  let opgaver = localStorage.getItem("assigments");
  if (opgaver) {
    task_arr = JSON.parse(opgaver);
  }
  for (const task of task_arr) {
    task.rain = await hentVejret(task.taskDate);
    if (task.outside) {
    }
  }

  renderList();
}
hentGemte();
