# Импорт новостей Top50

Аггрегатор новостей проекта Top50. Является утилитой в поддержку RoR приложение top52.

Основные возможности:

* Импорт новостей из [parallel.ru](http://www.parallel.ru/news)
* Хранение новостей в базе данных
* Обновление новостей по заданному таймеру

## Требования

1. Установить все необходимые пакеты (в скрипте `config/install.bash`)
2. Развернуть RoR приложение top52 и выполнить миграции
3. Заполнить пользователя и название базы (`config/database.yml`)

## Установка

```bash
$ git clone https://github.com/mozharovsky/parallels-news.git ./
$ cd parallel-news
$ ./config/install.bash
```

Если разворачивается на чистой машине, то рекомендуется сперва убедиться, что установлен **sudo**, а далее установить **npm**. Сделать это можно, например, с помощью такой последовательности команд: 

```bash
$ curl -sL https://deb.nodesource.com/setup_9.x | bash -
$ sudo apt-get install -y nodejs
```

Инструкцию по установке npm можно найти на [официальном сайте](https://nodejs.org/en/download/package-manager/).

## Запуск

```bash
$ ./config/run.bash --port <port>
```

> По умолчанию разворачивается на порту 5000.
