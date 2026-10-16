const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const serviceData = {
  phone: { number: '01', title: 'Смартфоны\nи планшеты.', device: 'Телефон', intro: 'Когда важно снова быть на связи. Разбираемся с неисправностями смартфонов, планшетов и iPad.', items: ['Замена дисплея и повреждённого экрана', 'Замена аккумулятора', 'Проблемы с зарядкой и разъёмом', 'Не включается или нестабильно работает', 'Звук, микрофон и динамик', 'Диагностика после падения или попадания жидкости'] },
  computer: { number: '02', title: 'Ноутбуки\nи компьютеры.', device: 'Ноутбук', intro: 'Для работы, учёбы и домашних задач. Помогаем найти причину неисправности и вернуть стабильную работу.', items: ['Диагностика и ремонт ноутбуков и компьютеров', 'Чистка системы охлаждения', 'Проблемы с включением и питанием', 'Замена и подбор комплектующих — по модели', 'Установка Windows и настройка', 'Ремонт мониторов и принтеров'] },
  appliance: { number: '03', title: 'Бытовая\nтехника.', device: 'Бытовая техника', intro: 'Привычные вещи делают дом удобным. Уточним возможность ремонта вашей модели и условия передачи в мастерскую или выезда.', items: ['Телевизоры', 'Микроволновые печи', 'Роботы-пылесосы', 'Утюги и отпариватели', 'Тостеры', 'Блоки питания и другая бытовая электроника'] },
  audio: { number: '04', title: 'Аудио и другая\nэлектроника.', device: 'Аудио и другая электроника', intro: 'Хороший звук, любимая игра, привычные устройства. Расскажите модель и проблему — обсудим возможность ремонта.', items: ['Проводные и беспроводные наушники', 'Портативные колонки, в том числе JBL', 'Геймпады PlayStation и Xbox', 'Apple Watch и другие смарт-часы', 'Автомагнитолы', 'Диагностика другой электроники — по согласованию'] },
  other: { number: '+', title: 'Ещё несколько\nполезных вещей.', device: 'Другая техника', intro: 'В мастерской можно решить и повседневные задачи. Наличие аксессуаров и возможность печати уточните перед визитом.', items: ['Печать и копирование документов', 'Защитные стёкла', 'Кабели для зарядки', 'Адаптеры питания', 'Внешние аккумуляторы', 'Другие аксессуары — уточните наличие'] }
};

const symptoms = {
  'Телефон': [
    ['Не включается', 'Причина может быть в аккумуляторе, питании или других компонентах. Укажите модель и что произошло перед отключением.'],
    ['Не заряжается', 'Проблема может быть связана с кабелем, разъёмом, аккумулятором или цепью питания. Проверка поможет определить причину.'],
    ['Разбит экран', 'Пришлите модель и фото повреждения. Уточним возможные варианты дисплея и порядок ремонта.'],
    ['Быстро разряжается', 'Укажите возраст устройства и как давно появилась проблема. Проверим состояние аккумулятора и возможные причины расхода заряда.'],
    ['Попала жидкость', 'Сообщите, какая жидкость попала в устройство и когда это произошло. Это поможет мастеру оценить ситуацию при осмотре.'],
    ['Другая проблема', 'Опишите, что работает иначе, чем обычно. Даже небольшая деталь в описании может помочь при диагностике.']
  ],
  'Ноутбук': [
    ['Не включается', 'Расскажите, есть ли индикатор питания, звук или изображение. Укажите модель ноутбука и характеристики зарядного устройства.'],
    ['Перегревается', 'Уточните, когда ноутбук начинает шуметь или отключаться. Проверим охлаждение и причину перегрева.'],
    ['Работает медленно', 'Расскажите, в каких программах заметна проблема. Причина может быть в системе, накопителе или других компонентах.'],
    ['Нет изображения', 'Укажите, слышны ли вентиляторы и светятся ли индикаторы. Это поможет начать диагностику.'],
    ['Не заряжается', 'Укажите модель и поведение индикатора зарядки. Возможны проблемы с адаптером, разъёмом, батареей или питанием.'],
    ['Другая проблема', 'Опишите симптомы и когда они появились. По модели и описанию подскажем, как передать ноутбук в сервис.']
  ],
  'Другая техника': [
    ['Не включается', 'Укажите тип и модель техники. Если модель неизвестна, можно прислать фотографию наклейки с характеристиками.'],
    ['Работает с перебоями', 'Опишите, когда возникает проблема и что меняется в работе. Короткое видео может помочь объяснить симптомы.'],
    ['Нет звука или изображения', 'Сообщите модель устройства и какие функции продолжают работать. Возможность ремонта уточним по описанию.'],
    ['Есть повреждение', 'Пришлите фотографию устройства и повреждения. Уточним возможность проверки и ремонта.'],
    ['Другая проблема', 'Напишите, что за устройство и что с ним произошло. Уточним, работаем ли с вашей моделью.']
  ]
};
let selectedDevice = 'Телефон';
let selectedSymptom = symptoms[selectedDevice][0][0];
let currentService = 'phone';
let messageText = '';
let lastFocused = null;

function openDialog(dialog) {
  lastFocused = document.activeElement;
  closeMenu();
  $$('dialog[open]').forEach(item => item.close());
  dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
}

$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (!$('dialog[open]')) {
      document.body.classList.remove('modal-open');
      if (lastFocused?.isConnected) lastFocused.focus({preventScroll:true});
    }
  });
});

$$('[data-service]').forEach(button => button.addEventListener('click', () => {
  currentService = button.dataset.service;
  const service = serviceData[currentService];
  $('#service-dialog-index').textContent = `${service.number} / НАПРАВЛЕНИЯ РЕМОНТА`;
  $('#service-dialog-title').innerText = service.title;
  $('#service-dialog-intro').textContent = service.intro;
  const list = document.createElement('ul');
  list.className = 'service-detail-list';
  service.items.forEach(text => {
    const item = document.createElement('li');
    item.innerHTML = '<svg aria-hidden="true"><use href="#i-check"/></svg>';
    const span = document.createElement('span');
    span.textContent = text;
    item.append(span);
    list.append(item);
  });
  $('#service-dialog-content').replaceChildren(list);
  openDialog($('#service-dialog'));
}));

function resetRequest(device = 'Телефон', problem = '') {
  $('#diagnose-form').hidden = false;
  $('#request-result').hidden = true;
  $('#request-device').value = device;
  $('#request-model').value = '';
  $('#request-problem').value = problem;
  $('#copy-message').firstChild.textContent = 'Скопировать текст ';
  $('#copy-status').textContent = 'Скопируйте текст и вставьте его в переписку с @remont073.';
}

$$('[data-diagnose]').forEach(button => button.addEventListener('click', () => {
  resetRequest();
  openDialog($('#diagnose-dialog'));
}));

$('#service-discuss').addEventListener('click', () => {
  resetRequest(serviceData[currentService].device);
  openDialog($('#diagnose-dialog'));
});

function renderSymptoms() {
  const container = $('#symptom-options');
  container.replaceChildren();
  symptoms[selectedDevice].forEach(([name, advice], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    button.setAttribute('aria-pressed', String(index === 0));
    if (index === 0) {
      button.classList.add('selected');
      selectedSymptom = name;
      $('#symptom-advice').textContent = advice;
    }
    button.addEventListener('click', () => {
      $$('button', container).forEach(item => {item.classList.remove('selected'); item.setAttribute('aria-pressed', 'false');});
      button.classList.add('selected');
      button.setAttribute('aria-pressed','true');
      selectedSymptom = name;
      $('#symptom-advice').textContent = advice;
    });
    container.append(button);
  });
}
$$('[data-device]').forEach(button => button.addEventListener('click', () => {
  selectedDevice = button.dataset.device;
  $$('[data-device]').forEach(item => {item.classList.toggle('selected', item === button);item.setAttribute('aria-pressed',String(item === button));});
  renderSymptoms();
}));
renderSymptoms();
$('#diagnostic-next').addEventListener('click', () => {
  resetRequest(selectedDevice, selectedSymptom);
  openDialog($('#diagnose-dialog'));
});

$('#diagnose-form').addEventListener('submit', event => {
  event.preventDefault();
  const problem = $('#request-problem').value.trim();
  if (!problem) {$('#request-problem').value = ''; $('#request-problem').reportValidity(); return;}
  const device = $('#request-device').value;
  const model = $('#request-model').value.trim();
  messageText = `Здравствуйте, ARGEO! Хочу обсудить ремонт.\n\nУстройство: ${device}${model ? '\nМодель: ' + model : ''}\nПроблема: ${problem}\n\nПодскажите, пожалуйста, возможность ремонта, условия диагностики и как передать устройство.`;
  $('#message-preview').textContent = messageText;
  $('#diagnose-form').hidden = true;
  $('#request-result').hidden = false;
  $('#diagnose-dialog').scrollTop = 0;
  $('#copy-message').focus({preventScroll:true});
});
$('#copy-message').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(messageText);
    $('#copy-status').textContent = 'Текст скопирован. Откройте Telegram и вставьте его в переписку.';
    $('#copy-message').firstChild.textContent = 'Текст скопирован ';
  } catch {
    const range = document.createRange();
    range.selectNodeContents($('#message-preview'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    $('#copy-status').textContent = 'Текст выделен. Скопируйте его вручную и вставьте в Telegram.';
  }
});
$('#edit-message').addEventListener('click', () => {
  $('#diagnose-form').hidden = false;
  $('#request-result').hidden = true;
  $('#request-problem').focus();
  $('#copy-message').firstChild.textContent = 'Скопировать текст ';
});
$('#privacy-open').addEventListener('click', () => openDialog($('#privacy-dialog')));

$('#art-toggle').addEventListener('click', () => {
  const exploded = $('#device-art').classList.toggle('exploded');
  $('#art-toggle').setAttribute('aria-pressed',String(exploded));
  $('#art-toggle .toggle-icon').textContent = exploded ? '−' : '＋';
  $('#art-toggle>span:last-child').textContent = exploded ? 'Собрать обратно' : 'Посмотреть внутри';
  $('#device-art').dispatchEvent(new CustomEvent('argeo:disassembly',{detail:{exploded}}));
});

const menuButton = $('.menu-toggle');
const menu = $('#mobile-menu');
function closeMenu() {
  menu.classList.remove('open');
  menu.inert = true;
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Открыть меню');
  document.body.classList.remove('menu-open');
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (isOpen) closeMenu();
  else {
    menu.inert = false;
    menu.classList.add('open');
    menuButton.setAttribute('aria-expanded','true');
    menuButton.setAttribute('aria-label','Закрыть меню');
    document.body.classList.add('menu-open');
  }
});
$$('a',menu).forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {closeMenu();menuButton.focus();}
  if (event.key === 'Tab' && menu.classList.contains('open')) {
    const links = $$('a',menu);
    if (!event.shiftKey && document.activeElement === links.at(-1)) {event.preventDefault();menuButton.focus();}
    if (event.shiftKey && document.activeElement === menuButton) {event.preventDefault();links.at(-1).focus();}
  }
});
window.matchMedia('(min-width:701px)').addEventListener('change',event => {if(event.matches) closeMenu();});

const track = $('#reviews-track');
function updateReviewButtons() {
  $('#review-prev').disabled = track.scrollLeft < 5;
  $('#review-next').disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
}
function scrollReviews(direction) {
  const card = $('.review-card',track);
  track.scrollBy({left:direction * (card.getBoundingClientRect().width + (innerWidth <= 700 ? 12 : 20)),behavior:reducedMotion.matches ? 'instant' : 'smooth'});
}
$('#review-prev').addEventListener('click',()=>scrollReviews(-1));
$('#review-next').addEventListener('click',()=>scrollReviews(1));
track.addEventListener('scroll',updateReviewButtons,{passive:true});
new ResizeObserver(updateReviewButtons).observe(track);
updateReviewButtons();

const header = $('#header');
const actionBar = $('.mobile-action-bar');
let nearContacts = false;
function updateScroll() {
  header.classList.toggle('scrolled',scrollY > 20);
  actionBar.classList.toggle('visible', scrollY > 600 && !nearContacts);
}
window.addEventListener('scroll',updateScroll,{passive:true});
new IntersectionObserver(entries => {nearContacts = entries[0].isIntersecting;updateScroll();},{threshold:0}).observe($('#contacts'));
updateScroll();
$('#year').textContent = String(new Date().getFullYear());

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.08,rootMargin:'0px 0px 10px 0px'});
  $$('.section-heading,.service-row,.diagnostic-intro,.diagnostic-tool,.approach-statement,.process-step,.story-copy,.circuit-art,.cost-layout,.family-note,.reviews-head,.faq-intro,.faq-list,.contacts-layout').forEach(element=>{element.classList.add('reveal');observer.observe(element);});
  reducedMotion.addEventListener('change',event=>{if(event.matches) $$('.reveal').forEach(element=>element.classList.add('visible'));});
}
