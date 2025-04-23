// временно указываем базовый адрес сайта, чтобы проверить, как формируется полный (абсолютный) путь.
process.env.WEBAPP_URL = "https://example.com";

// импортируем функцию pgr, которая помогает удобно создавать пути (routes) в React-приложении с помощью react-router-dom.
import { pgr } from "./pumpGetRoute";

describe("pgr", () => {
  //  Тест: простой путь без параметров
  it("return simple route", () => {
    // создаём простой маршрут без параметров
    const getSimpleRoute = pgr(() => "/simple");

    // ожидаем, что при вызове он вернёт строку "/simple"
    expect(getSimpleRoute()).toBe("/simple");
  });

  // Тест: путь с параметрами
  it("return route with params", () => {
    // создаём маршрут с двумя параметрами: param1 и param2
    const getWithParamsRoute = pgr(
      { param1: true, param2: true },
      ({ param1, param2 }) => `/a/${param1}/b/${param2}/c`
    );

    // ожидаем, что при передаче значений параметры подставятся правильно
    expect(getWithParamsRoute({ param1: "xxx", param2: "yyy" })).toBe(
      "/a/xxx/b/yyy/c"
    );
  });

  //  Тест: проверка шаблона маршрута (definition)
  it("return route definition", () => {
    // создаём маршрут с параметрами
    const getWithParamsRoute = pgr(
      { param1: true, param2: true },
      ({ param1, param2 }) => `/a/${param1}/b/${param2}/c`
    );

    // ожидаем, что definition будет содержать путь с :param1 и :param2
    expect(getWithParamsRoute.definition).toBe("/a/:param1/b/:param2/c");
  });

  // 🧪 Тест: проверка placeholders (заглушек) — они нужны, чтобы знать, какие параметры есть
  it("return route placeholders", () => {
    const getWithParamsRoute = pgr(
      { param1: true, param2: true },
      ({ param1, param2 }) => `/a/${param1}/b/${param2}/c`
    );

    // ожидаем, что placeholders будут вида { param1: ":param1", param2: ":param2" }
    expect(getWithParamsRoute.placeholders).toMatchObject({
      param1: ":param1",
      param2: ":param2",
    });
  });

  // 🧪 Тест: проверка абсолютного пути (с доменом)
  it("return absolute route", () => {
    // создаём простой маршрут
    const getSimpleRoute = pgr(() => "/simple");

    // передаём параметр abs: true, чтобы получить полный путь с доменом
    expect(getSimpleRoute({ abs: true })).toBe("https://example.com/simple");
  });
});
