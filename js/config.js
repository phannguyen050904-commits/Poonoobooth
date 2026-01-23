// Canvas layouts configuration
export const canvasLayouts = {
  '3x2': { width: 960, height: 1280, rows: 3, cols: 2, bottomPadding: 1280/(8-5/3), side: 0 },
  '4x1': { width: 480, height: 1440, rows: 4, cols: 1, bottomPadding: 120, rightside: 20, leftside: 20 },
  '2x2': { width: 960, height: 960, rows: 2, cols: 2, bottomPadding: 240 },
  '2x1': { width: 480, height: 960, rows: 2, cols: 1, bottomPadding: 240 },
  '1x1': { width: 480, height: 640, rows: 1, cols: 1, bottomPadding: 160 }
};

// Lyrics data
export const noiNayCoAnhLyrics = [
  { text: "Em là ai bước đến nơi đây dịu dàng chân phương", duration: 5000 },
  { text: "Em là ai tựa như ánh nắng ban mai ngọt ngào trong sương", duration: 5000 },
  { text: "Ngắm em thật lâu", duration: 2500 },
  { text: "Con tim anh yếu mềm", duration: 2500 },
  { text: "Đắm say từ phút đó", duration: 2500 },
  { text: "Từng giây trôi yêu thêm", duration: 3500 },
  { text: "Bao ngày qua bình minh đánh thức xua tan bộn bề nơi anh", duration: 5000 },
  { text: "Bao ngày qua niềm thương nỗi nhớ bay theo bầu trời trong xanh", duration: 5000 },
  { text: "Liếc đôi hàng mi", duration: 3000 },
  { text: "Mong manh anh thẫn thờ", duration: 2900 },
  { text: "Muốn hôn nhẹ mái tóc", duration: 2000 },
  { text: "Bờ môi em anh mơ", duration: 2800 },
  { text: "Cầm tay anh dựa vai anh", duration: 2400 },
  { text: "Kể bên anh nơi này có anh", duration: 2400 },
  { text: "Gió mang câu tình ca", duration: 1900 },
  { text: "Ngàn ánh sao vụt qua nhẹ ôm lấy em", duration: 3500 },
  { text: "Cầm tay anh dựa vai anh", duration: 2400 },
  { text: "Kể bên anh nơi này có anh", duration: 2400 },
  { text: "Khép đôi mi thật lâu", duration: 2000 },
  { text: "Nguyện mãi bên cạnh nhau yêu say đắm như ngày đầu", duration: 4000 },
  { text: "Mùa xuân đến bình yên", duration: 2750 },
  { text: "Cho anh những giấc mơ", duration: 2600 },
  { text: "Hạ lưu giữ ngày mưa", duration: 2700 },
  { text: "Ngọt ngào nên thơ", duration: 2500 },
  { text: "Mùa thu lá vàng rơi", duration: 2700 },
  { text: "Đông sang anh nhớ em", duration: 2500 },
  { text: "Tình yêu bé nhỏ xin", duration: 2500 },
  { text: "Dành tặng riêng em", duration: 3000 },  
  { text: "𝅗𝅥 𝅘𝅥 𝅘𝅥𝅮 𝅗𝅥 𝅘𝅥 𝅘𝅥𝅮", duration: 6000 }
];

// Filter configurations
export const filterConfigs = [
  { name: "Sơn Tùng-MTP", path: "filters/Sơn Tùng-MTP.png", offsetX: 0, offsetY: 2, scale: 3 },
  { name: "flower wreath", path: "filters/Dont starve together/flower wreath.png", offsetX: 0, offsetY: 0.5, scale: 2.3 },
  { name: "cylinder", path: "filters/Dont starve together/cylinder.png", offsetX: 0, offsetY: 0.7, scale: 2.7 },
  { name: "buffalo hat", path: "filters/Dont starve together/buffalo hat.png", offsetX: 0, offsetY: 0.6, scale: 3.6 },
  { name: "winter hat", path: "filters/Dont starve together/winter hat.png", offsetX: 0, offsetY: 0.65, scale: 2.6 },
  { name: "straw hat", path: "filters/Dont starve together/winter hat.png", offsetX: 0, offsetY: 0.65, scale: 2.6 },
  { name: "mũ đầu bếp", path: "filters/Mũ đầu bếp.png", offsetX: 0, offsetY: 0.65, scale: 2.8 },
  { name: "vòng hoa", path: "filters/vòng hoa.png", offsetX: 0, offsetY: 0.5, scale: 2.6 },
  { name: "T1 6 sao", path: "filters/T1 6 sao.png", offsetX: 0, offsetY: 2.9, scale: 1.0 },
  { name: "hat art 1", path: "filters/Oxygen not includ/hat art 1.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
  { name: "hat art 2", path: "filters/Oxygen not includ/hat art 2.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
  { name: "hat art 3", path: "filters/Oxygen not includ/hat art 3.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat astronut 1", path: "filters/Oxygen not includ/hat astronut 1.png", offsetX: -0.1, offsetY: 0.25, scale: 2.7 },
  { name: "hat astronut 2", path: "filters/Oxygen not includ/hat astronut 2.png", offsetX: -0.1, offsetY: 0.25, scale: 2.7 },
  { name: "hat basekeeping 1", path: "filters/Oxygen not includ/hat basekeeping 1.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat basekeeping 2", path: "filters/Oxygen not includ/hat basekeeping 2.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat building 1", path: "filters/Oxygen not includ/hat building 1.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat building 2", path: "filters/Oxygen not includ/hat building 2.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat building 3", path: "filters/Oxygen not includ/hat building 3.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat cooking 1", path: "filters/Oxygen not includ/hat cooking 1.png", offsetX: 0.05, offsetY: 0.8, scale: 2.1 },
  { name: "hat cooking 2", path: "filters/Oxygen not includ/hat cooking 2.png", offsetX: 0.05, offsetY: 0.8, scale: 2.1 },
  { name: "hat engineering", path: "filters/Oxygen not includ/hat cooking 3.png", offsetX: 0.05, offsetY: 0.75, scale: 2.25 },
  { name: "hat farming 1", path: "filters/Oxygen not includ/hat farming 1.png", offsetX: 0, offsetY: 0.85, scale: 2.75 },
  { name: "hat farming 2", path: "filters/Oxygen not includ/hat farming 2.png", offsetX: 0, offsetY: 0.85, scale: 2.75 },
  { name: "hat farming 3", path: "filters/Oxygen not includ/hat farming 3.png", offsetX: 0, offsetY: 0.85, scale: 2.7 },
  { name: "hat hauling 1", path: "filters/Oxygen not includ/hat hauling 1.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
  { name: "hat hauling 2", path: "filters/Oxygen not includ/hat hauling 2.png", offsetX: 0.05, offsetY: 0.8, scale: 2.25 },
  { name: "hat medicalaid 1", path: "filters/Oxygen not includ/hat medicalaid 1.png", offsetX: -0.05, offsetY: 0.6, scale: 2.3 },
  { name: "hat medicalaid 2", path: "filters/Oxygen not includ/hat medicalaid 2.png", offsetX: -0.05, offsetY: 0.6, scale: 2.3 },
  { name: "hat medicalaid 3", path: "filters/Oxygen not includ/hat medicalaid 3.png", offsetX: -0.05, offsetY: 0.6, scale: 2.3 },
  { name: "hat mining 1", path: "filters/Oxygen not includ/hat mining 1.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
  { name: "hat mining 2", path: "filters/Oxygen not includ/hat mining 2.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
  { name: "hat mining 3", path: "filters/Oxygen not includ/hat mining 3.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
  { name: "hat mining 4", path: "filters/Oxygen not includ/hat mining 4.png", offsetX: -0.05, offsetY: 0.85, scale: 2.6 },
  { name: "hat rancher 1", path: "filters/Oxygen not includ/hat rancher 1.png", offsetX: -0.05, offsetY: 0.85, scale: 2.7 },
  { name: "hat rancher 2", path: "filters/Oxygen not includ/hat rancher 2.png", offsetX: -0.05, offsetY: 0.885, scale: 2.7 },
  { name: "hat suit 1", path: "filters/Oxygen not includ/hat suit 1.png", offsetX: 0, offsetY: 0.6, scale: 2.35 },
  { name: "hat suit 2", path: "filters/Oxygen not includ/hat suit 2.png", offsetX: 0, offsetY: 0.6, scale: 2.35 },
  { name: "hat technical 1", path: "filters/Oxygen not includ/hat technical 1.png", offsetX: 0.05, offsetY: 0.85, scale: 2.3 },
  { name: "hat technical 2", path: "filters/Oxygen not includ/hat technical 2.png", offsetX: 0.05, offsetY: 0.85, scale: 2.3 },
  { name: "Fakerlike", path: "filters/idol/Faker like.png", offsetX: 0.65, offsetY: -0.3, scale: 6.6 }
];

// Theme configurations
export const themeNames = ['Đi làm', 'Danisa', 'Dont starve together 1', 'MCK', 'GAMTIME'];

// Dialogue configurations
export const dialogueConfigs = [
  { name: "speech_bubble_1", path: "dialogues/speech_bubble_1.png" },
  { name: "speech_bubble_2", path: "dialogues/speech_bubble_2.png" },
  { name: "pixel_bubble_1", path: "dialogues/pixel_bubble_1.png" },
  { name: "pixel_bubble_2", path: "dialogues/pixel_bubble_2.png" }
];

// Grain configurations
export const grainConfigs = [
  { name: "oldfilm", path: "textures/Old Film.mp4" },
  { name: "dustandscratches", path: "textures/dustandscratches.mp4" },
  { name: "hardgrain", path: "textures/hardgrain.mp4" }
];