# Базовый образ Node.js
FROM node:18

# Установка рабочей директории внутри контейнера
WORKDIR /app

# Копирование package.json и package-lock.json для установки зависимостей
COPY . .

# Установка зависимостей
RUN npm install

# Открытие порта, который будет использоваться внутри контейнера
EXPOSE 3000

RUN npm run build
# Запуск команды для старта приложения
CMD ["npm", "start"]