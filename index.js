const fetch = require('node-fetch')
const fs = require('fs-extra')
const _ = require('lodash')
const request = require('request')
const env = require('./env')

async function run() {
  fs.mkdirpSync('wiki/')
  const pages = await get_wiki_pages()
  export_wikis(pages)
  fs.mkdirpSync('issue/')
  const issues = await get_issues()
  export_issues(issues)
}

async function get_wiki_pages() {
  const endpoint = `${env.backlog_host}api/v2/wikis?apiKey=${env.api_key}&projectIdOrKey=${env.project_id}`
  return await fetch(endpoint).then(res => res.json())
}

async function export_wikis(pages) {
  for(let page of pages) {
    const endpoint = `${env.backlog_host}api/v2/wikis/${page.id}?apiKey=${env.api_key}`
    const response = await fetch(endpoint).then(res => res.json())
    const dirs = _.split(response.name, '/')
    if (dirs.length > 1) {
      fs.mkdirpSync('wiki/' + _.join(_.take(dirs, dirs.length - 1), '/'))
    }
    fs.writeFile(`wiki/${response.name}.md`, response.content, function (err) {
      if (err) {
        console.log(err);
      }
    })
    if (response.attachments.length > 0) {
      await export_wiki_attachments(page.id, response.name, response.attachments)
    }
  }
}

async function export_wiki_attachments(wiki_id, wiki_name, attachments) {
  fs.mkdirpSync('wiki/' + wiki_name)
  for (let attachment of attachments) {
    const endpoint = `${env.backlog_host}api/v2/wikis/${wiki_id}/attachments/${attachment.id}?apiKey=${env.api_key}`
    request.get(endpoint, {encoding: null}, (err, response, body) => {
      if (err) {
        console.log(err)
      } else {
        fs.writeFile(`wiki/${wiki_name}/${attachment.name}`, body, function (err) {
          if (err) {
            console.log(err)
          }
        })
      }
    })
  }
}

async function get_issues() {
  const endpoint = `${env.backlog_host}api/v2/issues?apiKey=${env.api_key}&projectId[0]=${env.project_id}&count=100`
  return await fetch(endpoint).then(res => res.json())
}

async function export_issues(issues) {
  for (let issue of issues) {
    const summary = issue.summary.replace(' ', '').replace(':', '：')
    fs.writeFile(`issue/${issue.issueKey}_${summary}.json`, JSON.stringify(issue), function (err) {
      if (err) {
        console.log(err)
      }
    })
    fs.mkdirpSync(`issue/${issue.issueKey}_${summary}`)
    fs.writeFile(`issue/${issue.issueKey}_${summary}/description.md`, issue.description, function (err) {
      if (err) {
        console.log(err)
      }
    })
    await export_issue_comments(issue.issueKey, summary)
    if (issue.attachments.length > 0) {
      await export_issue_attachments(issue.issueKey, summary, issue.attachments)
    }
  }
}

async function export_issue_comments(issue_key, summary) {
  fs.mkdirpSync(`issue/${issue_key}_${summary}`)
  const endpoint = `${env.backlog_host}api/v2/issues/${issue_key}/comments?apiKey=${env.api_key}`
  const comments = await fetch(endpoint).then(res => res.json())
  if (comments.length > 0) {
    fs.writeFile(`issue/${issue_key}_${summary}/comments.json`, JSON.stringify(comments), function (err) {
      if (err) {
        console.log(err)
      }
    })
  }
}

async function export_issue_attachments(issue_key, summary, attachments) {
  fs.mkdirpSync(`issue/${issue_key}_${summary}`)
  for (let attachment of attachments) {
    const endpoint = `${env.backlog_host}api/v2/issues/${issue_key}/attachments/${attachment.id}?apiKey=${env.api_key}`
    request.get(endpoint, {encoding: null}, (err, response, body) => {
      if (err) {
        console.log(err);
      } else {
        fs.writeFile(`issue/${issue_key}_${summary}/${attachment.name}`, body, function (err) {
          if (err) {
            console.log(err);
          }
        })
      }
    })
  }
}

run()
