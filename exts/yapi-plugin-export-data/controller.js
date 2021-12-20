const baseController = require('controllers/base.js');
const interfaceModel = require('models/interface.js');
const projectModel = require('models/project.js');
// const wikiModel = require('../yapi-plugin-wiki/wikiModel.js');
const interfaceCatModel = require('models/interfaceCat.js');
const yapi = require('yapi.js');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItTableOfContents = require('markdown-it-table-of-contents');
const defaultTheme = require('./defaultTheme.js');
const md = require('../../common/markdown');
const { exportHtml } = require('./ExportHtml');

// const htmlToPdf = require("html-pdf");
class exportController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.catModel = yapi.getInst(interfaceCatModel);
    this.interModel = yapi.getInst(interfaceModel);
    this.projectModel = yapi.getInst(projectModel);

  }

  async handleListClass(pid, status) {
    let result = await this.catModel.list(pid),
      newResult = [];
    for (let i = 0, item, list; i < result.length; i++) {
      item = result[i].toObject();
      list = await this.interModel.listByInterStatus(item._id, status);
      list = list.sort((a, b) => {
        return a.index - b.index;
      });

      let datas = [];
      if (list) {
        for (let i in list) {
          let api = list[i]
          if (api.ref_id) {
            let ref = await this.interModel.get(api.ref_id);
            if (ref) {
              let data = Object.assign(ref, {
                catid: api.catid,
                project_id: api.project_id,
                type: api.type,
                _id: api._id
              });
              datas.push(data)
            }
          } else {
            datas.push(api)
          }
        }
      }

      if (list.length > 0) {
        item.list = datas;
        newResult.push(item);
      }
    }

    return newResult;
  }

  handleExistId(data) {
    function delArrId(arr, fn) {
      if (!Array.isArray(arr)) return;
      arr.forEach(item => {
        delete item._id;
        delete item.__v;
        delete item.uid;
        delete item.edit_uid;
        delete item.catid;
        delete item.project_id;

        if (typeof fn === 'function') fn(item);
      });
    }

    delArrId(data, function (item) {
      delArrId(item.list, function (api) {
        delArrId(api.req_body_form);
        delArrId(api.req_params);
        delArrId(api.req_query);
        delArrId(api.req_headers);
        if (api.query_path && typeof api.query_path === 'object') {
          delArrId(api.query_path.params);
        }
      });
    });

    return data;
  }

  /**
   * 导出接口文档 /exportData
   * @param {*} ctx 
   * @returns 
   */
  async exportData(ctx) {
    let pid = ctx.request.query.pid;
    let type = ctx.request.query.type;
    let status = ctx.request.query.status;
    let isWiki = ctx.request.query.isWiki;

    if (!pid) {
      ctx.body = yapi.commons.resReturn(null, 200, 'pid 不为空');
    }
    let curProject, wikiData;
    let tp = '';
    try {
      curProject = await this.projectModel.get(pid);
      if (isWiki === 'true') {
        const wikiModel = require('../yapi-plugin-wiki/wikiModel.js');
        wikiData = await yapi.getInst(wikiModel).get(pid);
      }
      console.log(wikiData)
      ctx.set('Content-Type', 'application/octet-stream');
      const list = await this.handleListClass(pid, status);

      switch (type) {
        case 'markdown': {
          tp = await createMarkdown.bind(this)(list, false);
          ctx.set('Content-Disposition', `attachment; filename=api.md`);
          return (ctx.body = tp);
        }
        case 'json': {
          let data = this.handleExistId(list);
          tp = JSON.stringify(data, null, 2);
          ctx.set('Content-Disposition', `attachment; filename=api.json`);
          return (ctx.body = tp);
        }
        case 'ks-html': {
          tp = await exportHtml.bind(this)(curProject, wikiData,list)
          ctx.set('Content-Disposition', `attachment; filename=api.html`);
          // ctx.set('Content-Type', 'text/html; charset=UTF-8');
          return (ctx.body = tp);
        }
        default: {
          //默认为html
          tp = await createHtml.bind(this)(list);
          ctx.set('Content-Disposition', `attachment; filename=api.html`);
          return (ctx.body = tp);
        }
      }
    } catch (error) {
      yapi.commons.log(error, 'error');
      ctx.body = yapi.commons.resReturn(null, 502, '下载出错');
    }

    async function createHtml(list) {
      // 转换为md，在通过md转换为html
      let md = await createMarkdown.bind(this)(list, true);
      let markdown = markdownIt({ html: true, breaks: true });
      markdown.use(markdownItAnchor); // Optional, but makes sense as you really want to link to something
      markdown.use(markdownItTableOfContents, {
        markerPattern: /^\[toc\]/im
      });

      // require('fs').writeFileSync('./a.markdown', md);
      let tp = unescape(markdown.render(md));
      // require('fs').writeFileSync('./a.html', tp);
      let left;
      // console.log('tp',tp);
      let content = tp.replace(
        /<div\s+?class="table-of-contents"\s*>[\s\S]*?<\/ul>\s*<\/div>/gi,
        function (match) {
          left = match;
          return '';
        }
      );

      return createHtml5(left || '', content);
    }

    function createHtml5(left, tp) {
      //html5模板
      let html = `<!DOCTYPE html>
      <html>
      <head>
      <title>${curProject.name}</title>
      <meta charset="utf-8" />
      ${defaultTheme}
      </head>
      <body>
        <div class="m-header">
          <a href="#" style="display: inherit;"><svg class="svg" width="32px" height="32px" viewBox="0 0 64 64" version="1.1">  <image id="image0" width="60" height="60" x="0" y="0"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAABxCAYAAADifkzQAAAABGdBTUEAALGPC/xhBQAAACBjSFJN
      AAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAABmJLR0QA/wD/AP+gvaeTAAAA
      CXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QwKASodLb/nMgAAGTpJREFUeNrdXXl8FEX2/1bP
      5JrcISQk4YxglI33vQZvwWuRHwguoi67KurPY2U9fl7r7eIKeKCcovzEA0+uiKtBvBBEQBCZBAIJ
      JIRhEgSSkHMyR+0ffVV19yQzSfdM8PEZMl1dXcf71nv13qvqGkIpxTFPbmcugEIAx0ufvgAyAAhS
      jg4ARwAcAlAJoAzAZuQUHo12080gckyC6HbGAbgCwJUALoYIXLjkB7AFwNcAigGsR07hMciMYw1E
      t/M4APcBuAlAqsmlVwFYCGA+cgoPRbur4dCxAaLbeSKAxwFcD8BmcW2tAOYBmHasgNm7QXQ7kwA8
      AVH6YiJc+xEAjwBYiJzCQLRZ0Rn1XhDdzhEA3gMwIMotWQ/gBuQUVkebJcGo94HodgoAHoMogfZo
      N0eiBgB/RU7h8mg3xIh6F4huZyyAxRDnvt5GFMCDyCmcGe2GaKn3gOh2OgCsBHBptJvSBc0A8FBv
      ckeEnhdhAokSeCwACAAPAJge7UawFH0Q3U4C4C0cGwDKdD/czqnRboRM0QcReAjApGg3ohs0HW7n
      BdFuBBDtOdHtLALwDXqPFRouHQBwGnIKD0azEdGTRNGQeRvHLoAAkAtgdrQbEU11+hiA/GgzwAS6
      Dm7nldFsQHTUqduZD3E5KC6anTeRKgCciJxCXzQqj5YkPorfD4AAMBTAjdGqPPKS6HYOgDhyY6PV
      aYuoHMDwaATLoyGJd+D3ByAAFAAYFY2KIwuiGNyOmtqJAN0cjUojLYkXABgYjY5GiK6F25kS6Uoj
      DWJUTfEIUAKACyNdaaQd7UsAYOuvZfhyzXco3bEbdb8dQn1jaJvObIKAzIx0DD9hGC698I+44Pxz
      kBDfMyO3ra0dX6z5Hj/8uAnVNS7UHjwET0dHSM8mxMcht18WTj1pOEZdeiFOO3m43MfiSDI1ctap
      25nya+nO+n/NnC1s/bXMlCLTUlNw1603YdL1Y2ATwlMq/kAA7324HHPefBf1DY2mtOeUwhPxwD23
      lZ99zaQTTOdfJxQxEG8aPXLGlm2l9/t85vvD55x5Kl578SmkpiSHlL+puQX3P/Y8vlv3k+ltsQkC
      BJvwiLPK9YLphQehiIBYkJf9JICnjO7Z7XY4HAkhleP1etHW1m5cx7B8vPfGK0hOSuy0jKbmFtw4
      ZSp27qo0vJ+QEI+YmND2ZLW2tqGTQflIuasuIkBaDmJBXva1AJYBIHJafFwcbrx+DEZfeRmOHzoE
      hJCQyztS34Bv1m7AG29/gL3VNdy9yy46H7NnPNPp83c98AS++nYdlzZ4YH9MmTwRF484FxnpaSG3
      hVKKXRV7UfzFGrzzwTK0ezzs7QCA0eWuulWWMhgWg1iQl50IMZKRJ6cNGTQA815+DoMH9u9R2T6f
      D8/NmI0ln6zk0l978SmMvGSE4TMlX6/FPQ89xaVNHPcnPP7g3bDbe2bjVe9z4fapj2kH1gEABeWu
      umaTWcuR1S7G38AA2DezD96eO6PHAAKiGn7q4b9j3OgruPS5b74b9BntvXGjr8BTj9zXYwABYNDA
      PCyeNxN9M/uwybkAbjGFk53xwuLy/8JePHDPrcjOyjS1goen3omvvl2HxqNNAICy8gqsXb8J+w+4
      sUeSivxBA5CX2w9l5RXKc6kpyXh46p2mtiWrbx88PPUO3P/Y82zyTQBeNbUiDVmmTgvystMAHIYk
      7Q5HQsfmb1fGal2B+oZG7K6sgs/v77S8flmZyB9sHOx5fuZsLF6yNKz23TxxLB67/y5dut/vx47y
      Chxtbun0+YT4OJxw/FCdn+oPBHBa0dUtno4O2cIKAMgod9WZ48cYkJWSeDwYdV0wNP+gTRA4Pbrx
      522Y8vdH0NbuCanAv066zlB6zj/njLBBPO+s03RpPp8Pk26bil+2h+bH5uX2w8f/Pxt9MtKUNJsg
      IC+3X8Weqn2nSEkCxOD4Rgt4rFRgFaWxF+lpqTrf4KPlq0IGEADe+XA5/AH9So9mHgqJMvtk6NI2
      b90eMoAA4DpQizXfrdOlp6YkaUNQaSEV2E2yUhKb2Ivmlhad83X8cUPCKnBo/iDDyIw8H7J0UdG5
      uH7s1ejo8GJp8Zc6x/6owTNDBg1AQnxcyAOLEIKh+YN06S2tbVrHtymkArtJVoJYxV5U7q3Wicst
      N18PhyMBuyr2dllYSnISJk0YY3hv67ZS7vraqy7Hi888rFxfcdmFeOiJF7Di89VK2jbnThSddxb3
      XHZWJhbNmY6V/1kDfxdztM1mQ9G5Z+D0Uwp199y1Bwd3xguzyWo/sRLMZqjF82binDNPNbUOn8+H
      q8b/DdU1LiXt3QUv46zTT+bybdryK26cou73HTQgD59//JYp7gVLP23+BTffcT+btKfcVXecqZVo
      yGo/8SP2YtpLc8OaA0OhN9/5iAMwOysTZ5x6ki7fGaeehH5ZfZXr6hoXFi7+KKQ6QqW2dg+mvTRX
      m/yhqZUYkNUgzoL45i0AYMeuCvzj0WfR2tpmSuHLPivBq3MXcWm33DgBgqAP4wkCwf/eym8qmDVv
      EZZ9VmJKW9ra2vGPR5/Fjl0VbHIrgNdNqaATikTs9B8AuNfBjhsyEA/ccxsu+OPZ3VJn1TUuzH3z
      XR0ABcPysfSduUHL9Pv9GHvTnbrg9zWjLsG9d0zGoAF5CJf8gQC++2EDZrz2Bir37tPefqDcVWf5
      q3CRAJFAfON3ovZeSnIShuYPRlKiA10tUQmCgEAggAO1B1G1b7/ufkZ6Gj54a1aXQFTXuPDnv92L
      I/UNunuDB/ZHbr8spa7OyG63o7mlFXuq9qHBeFF7CYBJ5a46y5eJIrUUFV9YWFjpdDpzrSg/OysT
      b7w6DQXDQttQXr57D277+yOoO2jNuQr5w47fu2f3ruHlrrr2npfWNUVsUfibNavfqtv5819fnbvI
      UAq6Q4JAMObqkXjw3ilhLSEB4pLW9FkLsHxVCQIBc3iQnpaK++6ZgvQhJy0YNWrU7SazMChFDMSS
      kpL5I0/Pn9LaWI+Plq/CF199h9Kdu9HR4Q27rP65/TDij2dj4rg/hSx9wah89x58sPQzrF2/ETUu
      d9jPx8bG4A8nDMMVl12ICWOuhiMzDyU/OReMHDkyYiBGdqNUbBIcjnZMvuE6TL7hOgCiRLSEYa2m
      p6UiKdFhWpMKhuXjyf+7FwDQ3NIa1n6bREeCXgPEJVnHvyAUWRDjk4EWfh7KSE8LWxWGQpRSfLN2
      AzweDy6/uCgkKzgp0dGzAUIE0NjE7j/fTYqwJCYCthjAH74KDZdmvPYGFi4W/eyrRl6El//1T+v7
      F58MIlh94JWeIv8uRkJaRKpZ/e0PynftnhqriMZHpm9aijyIjgwgjI1R3SUvYzB1x3gKm+xxIPGh
      bZk0myIPoi0mYtIYUUrq2/MyuknReck0qW9EpDFiZI8FEsw+uTN0ig6Itlgg0dwNU1GllFww22oj
      TtE7eCEpSwTzWKf4VM43jMYZCNEDkRAgrT+iOYJ7TLYYIJUPB4ezm90sigqIymiNdQAp2dFogglE
      gLQBQBT8Qi1FBURutCZmHpvWamqOOAh7AfWGs92A1DzTY47x8fHK956+iKqjpL6iv9tLqHeASAiQ
      PtBUIP/nmpHK9zHXmHioRVJfILl3TQG951w1IgDpg4BGF9DW0OPipkyeiLNOPwV+v99wW2G3KCUH
      SAx/o7LV1CtApJSK86RssdrjgKaDEE9s7j5J79D3nASb2K64ZL69vYR6BYg6hiT1FY2GBhfgD+0Q
      BMso1iFaoTZ1A3tvAhDoJSAaUmwiaOZxIC2HxDXISDvRgg1I7gc40qPNiS4paiDKKqkz1UQEm2hE
      JKQBzb8BbY3oqYrtkogNSMwQXZ9e4AOGQlEDUQYuJNVkjxPnpOQsoOWIaPgETD6Fwx4nSp0jXQTy
      GKJeLYlsPgCALRY0ORskJRvwNAPtTeLfbs2bBIiJF92a+BQgRn+CR28zYIJRxEDcVOYdOFJ13UKW
      RO195TouWbEWEfAB3nbA5xEBDfgBGkBTUztsNgKHI150YWx20UCxx4mgESGsukOljc4Orq9WU0Sc
      /aLxK1M//8F3cmubRQfzCnZRohL7iL5cWn8gfSB2NqRinycTSB8ApOWJ86sjQ9zrQ7rX9a5WKdo9
      fqz6oePk869bEbEFxshEbAh5mhCSW1HdEKl+weeneHbWJjz9ykZTDduupLPKdRSECLmEkKcj1VfL
      QSyaUHwiAe4GgF/Kfguaz+x1uLc/KcXBwx5U7W/Bp19U9LzAENu91fmbBDS5e8SE4hMtq5gh6yWR
      4jlIP1y56pv9QbN1ZdyEQ7W/tWDRx7tABAGECJi9uAz1R819LzJYu1eu2SdFn2AD8JwllWrIUhBH
      TCg+DQRjRQwIXLVt2Lvf+t9ifmHuFgQogUAEEELg6QjglYVbTSm7swG170AT9rnUo1MoMHbEhOLT
      Qim3J2QpiJTiUdE3Vzu+LETVxjIrHCvx+40ubNx2GEQyXAghIIKAr9bXYYuz5z8k01lbln5RoWwA
      I9KHUjxqHkeNyTIQiyYUDwUwDqBix6S+r/jKhSMNXb/x1R3zvt3jx7/nbwMRBABEdWPEAvHc61vg
      81lzWH5DYzuWflkjNx6ANHQJxhWNXznUkkolsk4SKe4kBIQQIjJRkiyfL4A3PyztUdHB6M2PnGho
      9IJAfO1NMjAA6f+6Qx68t6I8eJN7YFwt/LAMfj+VCxK7S6WqCTH3/DENWQJi0YTieIBOpkqfKLfP
      dPnqGuysrDe1zqr9R/H+ir0KcFSuF3zUZeEH5ag71GpYhhxBCpd2VB7BshLRoCGyIpWrpAABJheN
      XxkfdsEhklWSOAZAhtQHsDvaCBEZ/M+XNsLT4e9G0XqilGLanC1QB78MBJGAUev2U+CFuT8HLStc
      Ne7p8OPpV36Gdtcekf4jBKCUZgBkjPlsFskSEAkwXprWlSlR5iQFQEDgqm3FtDmbQi6zMwlZ/UMN
      tpfXS1IgtYBKf6gKKKS6f/rlMNZuOmBKX6fN2YQaNyvZlKtXbTYdbwWvAQtALBq/MolSXKUyjnKM
      VMYrIfhyrRsLljhDKjeYhLS2+fDi/G1g5z4qMZIxa3TlTJu7tceaYO5721Gytla/dVaZRyBJIwEh
      5KqiCcWWvIFqgSSSSwhBvMJzxrhgXQ0i/Xvr411YvHRHt2t77e1f0NLqVaqgoJIhBQQU64JRtFQE
      uL6xA2+EOICMaNHHpVj8aUWXgXxGCcUT6SclzCYr1OnllFJ1bmLMNDDfWGmZ804ZXlq4JWyjYndV
      A5aVVGsLVr5ICl29RflB9H5xJarCDD5QSjFjwWYsWFIuz3dSN6nyYXIrxpV073IL+G3+UlRGbtUY
      StVRSZV5UbX85DQQgErnxazesg/uxnL88/YxSEnq+nR+SileeXclMnKOMFKgWoU6yZAtZKrWT2kA
      s94vxswHbwjJoKk/2orn569A6d5apOcQZXOX7IfqNh0QdQKhlEIQMAbAPWbz3NTTMyY++fiAgUM3
      K8cqyWUTEFDGTuUkg/J54+wOjD3vXpwx9BJ09p7GhvLP8fG6l8U4gkDU2ZZ9RJ6T5PqVgcNoBkrx
      5xEP48yhwX9cnILi591r8OmPs+D1i4dESPFRQ/Dl+pR7jG21r+KsgUuefrYGJpKp6lSwecdJDpq4
      Ki6PQgN1KmpTontP0eNrxfvfv4Dpn96OPbXbDetp9TRh+YY5LJcltUm1U6B422CwsN8/Xf8qPF7j
      Ezwq3b9i+ie3YcnaF9Dhk61QBhyNDLADVlazLNlsHWPN5DlgsjqNjW27SDYcOIYp3gaVOslwnuMA
      AQ2Ic1lt4x68vmoq+iYPwJVn/AXDB52LWLvoL3+67jV4/R7J6pOKoVS1TDVMlfkNLYBSfR2+VqzY
      MB8TRtwHAOjwtaO0egM+37wIh5tdctOg+J1M+coAkdQqJVTpq9JfIj0RAGJi2y6GyQe7mwqize5R
      Y4T8/A7V1JE6RrnbzH4bcM75b001eOfb50CIgOH9z8Pg7OH4peprRVWFskfHmMSKZHB+2r0KWWn9
      sce9HWX7f0SABuRcnNpU9gaBUaXMACKUb4s2jeORSWQqiPaYtixFpbE+oYqUIWOJJk0EUpQyOeJC
      QVG6fx1K968H57IYAEjBz71Em84YOSwVb5rHzWc624gpC5IFrpTNGm3Mc7w9QGCPac8yk+eAySDG
      xLSlKA2X3QzekuEYAg441npVseHDrgYSp9TDGhEUlPCDSFGfrCMOtg6i+842UYyLqrAZaQIeZOkP
      UYcUBUVMbJvpP5JpqmFjs3fE6CZzhmfsfKWY5QyxS0eU8gDqi2RWKGQdrHJc9RFl343I6lO1YnlB
      pGCyceAxLQTj8/EASipV21a1xWKFdrsntF8TC4NMBZHYvIRtP2u8yVEU5Z6idaRVB3n5Rs4vGy0q
      LhwrdVEYDc8oZbnJSpa6XMQGlfi62TQZKG1viCLZnCYAry9oQA0GAAARfKZvZDVXEgWvrrsyQ9mA
      MBvFYBmj5lEjH3JUhOG9cq3DTlal3A2iNoLLpwlxEvlZ4/o0NenK1F0q7ecxs9m8poNoesSm6+CB
      CqY62gNQ5ItyM4vib4oGk96TZyWV55esHlU1qVrJvHWszKtM+9iyRFCJUqfOlmLmclCixG+1QFr1
      TpCpILIAsOpIYjPHJFbyVAuODZar5QVkE55oJUwtT2YyPzjkdO2SFJuPMYgYA4pZQlKeka8p1baZ
      fZQqc7oMdiBAQUyXP5VMBXHKAC8EgXfwjZdpiC4AoEiWzlnXFsPHZYli+UGTQ++viam886GsejDf
      eWgoc49oymIr1YfYtG0jAHx+89E0FcSClDhA2qSkD8d0RUaId5ZXZgvzHOePGESjmfip/pkg3iUr
      2roR1Ul7lWcIX6TfnN0MLJlq2LR45K1kwWxUyn8o+wFj22vyGD4HgMrVUem7Udly1QHWJOb9CK4c
      +RnK5GdNV/bSqJ1se8C3i1K0evymb7czFcS6NtKudEJHLEMZlct5xwbgstdc2ey1xnfRrOnpHE6D
      xWK+HKZ98j3FeYW+TWxeLmKj50NtG0w/od9UEF1HY8QVWo5hDCO0naLMaCddqCZWpXWLNPUwTj93
      rW2b0eBhTWFqAGgnM4mrKbbaTJ4DJoNY25L4GceEzpjEpmmiLbo8HJMM1g2NSGdQQaPlDZ1MI1+F
      B56LOhD+E8wQZ8qubXZ8BpPJVBCPtCU+D/mXXWRVyTGPtf2hqjluH04XzFNUYxAUuVV+A4ZzeZi2
      8Y4h0wHWQNFKJYJInSZUp/oaqG9Peh4mk+m/i1FVcmnL4PQY/aFnWkZwBiHVg8SlMXzRbETW12OQ
      wMXViJqmK5vJEs49aNK0A0Oqv7rB1zro8q9MP67f9I1SOw871gVXndp5SfqPfWtX/q4PlvL3dbYJ
      UZkov/vBuhKK2gMjyRotwAq41sCWn+MGCeE/hPmrk3oi8sYCMh3E/Y1pt4gqVcsgtsMajun8LhLk
      w+RTwCL8ANGKBwlWphFpAOHK1/TDaO7U1cuq4ABqGtNuMZvfgAXqFADKVl1+eHh2jHgMYbjqU9se
      nWplHWiN/tI52Mx9oyUR7dIFGyY0aosSadI8J5M2BsHcL6vzHhl+9WpLDoaz5PSMvZWp83JL6h+l
      DBODvazS9UssBlGUTsuVl7BoCGVr2wGlLm7Dk7ZcGUxAV76yzUTz/J7j+swz6aQ5fdutOrN6/+2j
      Av69MYTrmNFWCl2kn11olZnKA8bmlZmrfVZ7X5tXW7e+XB4Y9plg/WAHDQu0bbCX5s3/wrLXCC0r
      eE9/x3J23yWRUdGY6YL4noI6G7GbjwjUe9rt8lS/D8bozBvCfteE3Nj7gqROiZJXftFADYUTOZ+G
      xHtqO1kAAaAyL365VXwGLJREANh/xyh/YG9s0IFitCpAlXSq+27EPKr5y97VrjYo5RFGCpm8RPec
      umnKKD+Y9oHpCzsBCEM6Av3nfWnpOWOWvrNfOjD5GcGmLuHInZZHrtJpZis8u1TEg8lKCCOZynMq
      UFT6xtbKfqWKFKvWsXLeqvSc3DpWAyg1ErUtqsvC1iy2XbABpYOSn7GSx4DFkggAux66silhmz1J
      Ndb04Sllk5HOItQYNZJlyEqoPtLCyIWRxcnmDWqxGtTLFczXx2Zg624/xdc87N+fW/4DUpafY7Mz
      Jf0Ptr4+fWBfBkQHoNb3Y75TFT4dUSh5jWct/bysSpbGiVcnUg5Ao/iDIo1SBhl+e6YXOxxpv4/D
      iEY//v6+nQWJM4mdXeZRkVQOR2AlgNkaz5K660z2pVnfEQxATJmMn06lB9kDGZTnmUGij5WK/ylC
      rWykkuZKys6JgGCn2HFC4szRT74f/PQlEylivym85YnRZZk/0RMBjXYy2mYtKyVtgEBpNaMmtSox
      aGCA7bX6h+rKpXwdhM2nCSxo2y3Nt4fOITtOf2alVW6hjiIGIgDsfvCqpvjt9iRu+yA4ZcdHdDhs
      9BEd7cstWmYr97Ugcxxg07gJj7nPjpvO5+z2k7zNw6b/J6I/pBjR38VwpqanB07wekUTXe46M+eB
      UaOyiiNaIVRjmMoGYWa/Kiu+7BoyawFzKlUOnstDSQmVMrYtK8zaeK2cBgp/QYe3NC0jPZI8BYD/
      As1rJaMPNwGNAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIxLTEyLTA5VDE3OjQyOjI5KzA4OjAwkUUf
      iwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMS0xMi0wOVQxNzo0MjoyOSswODowMOAYpzcAAAAgdEVY
      dHNvZnR3YXJlAGh0dHBzOi8vaW1hZ2VtYWdpY2sub3JnvM8dnQAAABh0RVh0VGh1bWI6OkRvY3Vt
      ZW50OjpQYWdlcwAxp/+7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpIZWlnaHQAMTEz/4PLywAAABd0
      RVh0VGh1bWI6OkltYWdlOjpXaWR0aAAxMTNscpuWAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1h
      Z2UvcG5nP7JWTgAAABd0RVh0VGh1bWI6Ok1UaW1lADE2MzkwNDI5NDlU8BU3AAAAE3RFWHRUaHVt
      Yjo6U2l6ZQAyMTIyMUJCPqZcDwAAAEZ0RVh0VGh1bWI6OlVSSQBmaWxlOi8vL2FwcC90bXAvaW1h
      Z2VsYy9pbWd2aWV3Ml85XzE2Mzg4NDgwMzQ2MDk5Mjk2XzUxX1swXe6MTAgAAAAASUVORK5CYII=" ></image>
      </svg></a>
          <a href="#"><h1 class="title">凯叔 API 接口文档</h1></a>
          <div class="nav">
          </div>
        </div>
        <div class="g-doc">
          ${left}
          <div id="right" class="content-right">
          ${tp}
            <footer class="m-footer">
              <p>Build by <a href="https://ymfe.org/">YMFE</a>.</p>
            </footer>
          </div>
        </div>
      </body>
      </html>
      `;
      return html;
    }

    function createMarkdown(list, isToc) {
      //拼接markdown
      //模板
      let mdTemplate = ``;
      try {
        // 项目名称信息
        mdTemplate += md.createProjectMarkdown(curProject, wikiData);
        // 分类信息
        mdTemplate += md.createClassMarkdown(curProject, list, isToc);
        return mdTemplate;
      } catch (e) {
        yapi.commons.log(e, 'error');
        ctx.body = yapi.commons.resReturn(null, 502, '下载出错');
      }
    }
  }
}

module.exports = exportController;