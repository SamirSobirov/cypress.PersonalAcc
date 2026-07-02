describe('Profile Management Flow', () => {

  before(() => {
    cy.writeFile('auth_api_status.txt', 'UNKNOWN');
  });

  it('Авторизация -> Редактирование профиля Samir Sobirov', () => {
    cy.viewport(1280, 800);

    // =========================================================
    // ЧАСТЬ 1: АВТОРИЗАЦИЯ
    // =========================================================
    cy.intercept({
      method: 'POST',
      url: '**/login*'
    }).as('apiAuth');

    cy.visit('https://stage.metatrip-system.uz/sign-in', { timeout: 30000 });
    
    cy.url().should('include', '/sign-in');
    cy.get('body').should('be.visible');

    cy.env(['LOGIN_EMAIL', 'LOGIN_PASSWORD']).then((envVars) => {
      cy.get('input[type="text"]', { timeout: 15000 })
        .should('be.visible')
        .focus()
        .clear()
        .type(envVars.LOGIN_EMAIL, { delay: 50, log: false }); 

      cy.get('input[type="password"]')
        .should('be.visible')
        .focus()
        .clear()
        .type(envVars.LOGIN_PASSWORD, { delay: 50, log: false });

      cy.wait(1000); 

      cy.get('button.sign-in-page__submit')
        .should('be.visible')
        .click({ force: true });
    });

    cy.wait('@apiAuth', { timeout: 20000 }).then((interception) => {
      const statusCode = interception.response?.statusCode || 500;
      cy.writeFile('auth_api_status.txt', statusCode.toString());

      if (statusCode >= 400) {
        throw new Error(`🆘 Ошибка сервера при авторизации: HTTP ${statusCode}`);
      }
    });

    cy.url({ timeout: 20000 }).should('not.include', '/sign-in');
    cy.log('✅ Авторизация прошла успешно');

    // =========================================================
    // ЧАСТЬ 2: ПЕРЕХОД В ПРОФИЛЬ И РЕДАКТИРОВАНИЕ
    // =========================================================
    cy.log('🟢 ШАГ 1: Открытие выпадающего меню пользователя');
    // Клик по аватару в правом верхнем углу (Скриншот image_7a7221.jpg)
    cy.get('.app-avatar.cursor-pointer')
      .should('be.visible')
      .click({ force: true });

    cy.log('🟢 ШАГ 2: Переход в раздел Профиль');
    // Клик по кнопке "Профиль" в выпадающем списке (Скриншот image_7a7247.jpg)
    cy.get('button.app-header-user-menu-item')
      .contains(/Профиль|Profile/i)
      .should('be.visible')
      .click({ force: true });

    // Проверяем, что успешно перешли на страницу профиля
    cy.url({ timeout: 15000 }).should('include', '/profile');

    cy.log('🟢 ШАГ 3: Заполнение поля Имя');
    // Очищаем и вводим "Samir" в инпут с плейсхолдером "Имя" (Скриншот image_7a758b.jpg)
    cy.get('input[placeholder="Имя"]')
      .should('be.visible')
      .focus()
      .clear()
      .type('Samir', { delay: 50 });

    cy.log('🟢 ШАГ 4: Заполнение поля Фамилия');
    // Очищаем и вводим "Sobirov" в инпут с плейсхолдером "Фамилия" (Скриншот image_7a7621.jpg)
    cy.get('input[placeholder="Фамилия"]')
      .should('be.visible')
      .focus()
      .clear()
      .type('Sobirov', { delay: 50 });

    cy.log('🟢 ШАГ 5: Заполнение поля Телефон');
    // Ввод номера телефона "905059005" в специальный инпут типа tel (Скриншот image_7a7927.jpg)
    cy.get('input[type="tel"]')
      .should('be.visible')
      .focus()
      .clear()
      .type('905059005', { delay: 50 });

    cy.log('🟢 ШАГ 6: Сохранение изменений');
    // Клик по основной кнопке "Сохранить" внизу формы (Скриншот image_7a798d.jpg)
    cy.get('button.app-button--primary')
      .contains(/Сохранить|Save/i)
      .should('be.visible')
      .click({ force: true });

    cy.log('✅ Профиль успешно отредактирован и сохранен!');
  });
});