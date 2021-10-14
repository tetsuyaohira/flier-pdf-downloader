describe('download flier pdf', () => {
    beforeEach(() => {
        login();
    });

    it('download flier pdf', () => {
        for (let i = Cypress.env('start_index'); i < Cypress.env('last_index'); i++) {
            download(i);
        }
    });
});

function login() {
    cy.visit(Cypress.env('login_url'), {});
    cy.title()
        .should('include', '本の要約サイト flier(フライヤー)')

    cy.get('#email')
        .click()
        .type(Cypress.env('login_id'))
        .should('have.value', Cypress.env('login_id'));

    cy.get('#password')
        .click()
        .type(Cypress.env('login_password'))
        .should('have.value', Cypress.env('login_password'));

    cy.get('.center > .btn-fl-submit').click();

    cy.wait(1000);
    cy.log('Login OK.');
}

function download(i) {

    cy.visit(`https://www.flierinc.com/summary/${i}`, {});

    cy.url()
        .then((value) => {
            if (value.indexOf('summary') === -1) {
                cy.log(`content no.${i} file not found`);
                return;
            }

            cy.get('.btn-fl-pdf')
                .click(); // move view pdf

            cy.url()
                .then((value) => {
                        if (value.indexOf('pdfviewer') === -1) return;

                        cy.title()
                            .then((value) => {
                                const title = value.substring(0, value.lastIndexOf(' - PDF Viewer')) + '.pdf';
                                cy.get('script')
                                    .last()
                                    .then((value) => {
                                        const start = value.text().indexOf("'") + 1;
                                        const end = value.text().lastIndexOf("'");
                                        const url = value.text().substring(start, end);
                                        cy.request({url: url, encoding: 'binary'})
                                            .then((response) => {
                                                const filePath = 'cypress/downloads/' + title;
                                                cy.writeFile(filePath, response.body, 'binary');
                                                cy.log(`content no.${i} download:` + title);
                                            });
                                    });
                            });
                    }
                );
        });
}
