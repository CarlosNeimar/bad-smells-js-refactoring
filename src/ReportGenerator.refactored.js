// Constantes para tipos de relatório e papéis
const REPORT_TYPE_CSV = 'CSV';
const REPORT_TYPE_HTML = 'HTML';
const USER_ROLE_ADMIN = 'ADMIN';
const USER_ROLE_USER = 'USER';

// Constantes para regras de negócio (Números Mágicos)
const PRIORITY_THRESHOLD = 1000;
const STANDARD_USER_VALUE_LIMIT = 500;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  /**
   * Gera um relatório de itens (Refatorado).
   * Este método agora atua como um orquestrador.
   */
  generateReport(reportType, user, items) {
    // 1. Filtrar os itens com base nas regras de permissão
    const visibleItems = this._getVisibleItems(user, items);

    // 2. Calcular o total (agora feito uma única vez, sem duplicar)
    const total = visibleItems.reduce((sum, item) => sum + item.value, 0);

    // 3. Montar o relatório em partes
    let report = '';
    report += this._generateHeader(reportType, user);
    report += this._generateBody(reportType, user, visibleItems);
    report += this._generateFooter(reportType, total);

    return report.trim();
  }

  /**
   * Extraído: Filtra a lista de itens e aplica regras de negócio (ex: prioridade).
   * Resolve a complexidade de `user.role`.
   */
  _getVisibleItems(user, items) {
    if (user.role === USER_ROLE_ADMIN) {
      // Admins veem tudo. Aplicamos a regra de prioridade.
      return items.map((item) => {
        const hasPriority = item.value > PRIORITY_THRESHOLD;
        // Retorna uma cópia para evitar mutação do array original (boa prática)
        return { ...item, priority: hasPriority };
      });
    }

    if (user.role === USER_ROLE_USER) {
      // Users comuns só veem itens de valor baixo
      return items.filter((item) => item.value <= STANDARD_USER_VALUE_LIMIT);
    }

    return []; // Caso padrão (nenhuma role conhecida)
  }

  /**
   * Extraído: Gera o cabeçalho do relatório.
   */
  _generateHeader(reportType, user) {
    if (reportType === REPORT_TYPE_CSV) {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    if (reportType === REPORT_TYPE_HTML) {
      let header = '<html><body>\n';
      header += '<h1>Relatório</h1>\n';
      header += `<h2>Usuário: ${user.name}</h2>\n`;
      header += '<table>\n';
      header += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
      return header;
    }
    return '';
  }

  /**
   * Extraído: Gera o corpo (linhas) do relatório.
   * Não precisa mais se preocupar com `user.role` ou calcular `total`.
   */
  _generateBody(reportType, user, visibleItems) {
    let body = '';
    for (const item of visibleItems) {
      if (reportType === REPORT_TYPE_CSV) {
        body += `${item.id},${item.name},${item.value},${user.name}\n`;
      } else if (reportType === REPORT_TYPE_HTML) {
        const style = item.priority ? ' style="font-weight:bold;"' : '';
        body += `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
      }
    }
    return body;
  }

  /**
   * Extraído: Gera o rodapé do relatório.
   */
  _generateFooter(reportType, total) {
    if (reportType === REPORT_TYPE_CSV) {
      return `\nTotal,,\n${total},,\n`;
    }

    if (reportType === REPORT_TYPE_HTML) {
      let footer = '</table>\n';
      footer += `<h3>Total: ${total}</h3>\n`;
      footer += '</body></html>\n';
      return footer;
    }
    return '';
  }
}
  