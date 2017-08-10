import yaml from 'js-yaml';

/*
Raw markdown file example:
---
title: Starting with Flux
author: Chopper
tags:
  - Flux
  - MVC
  - Demo

date: 2015-06-03
---

We have been using Flux for months now and we are genuinely impressed with its predictable data flow, scalability and accessibility compared to MVC architectures. We know that it might appear a bit complicated to get started with, but we will explain some of the reasons that make Flux our go-to architecture. If you are already sold on Flux and need some help getting started feel free to skim down to our quick example below.

## About Flux
*/

export function parseYamlInsideMarkdown(text) {
  const splitter = '---';
  const targetLines = text.split('\n');
  const indexes = [];
  const lineCount = targetLines.length;
  for (let i = 0; i < lineCount; i++) {
    if (targetLines[i] === splitter) indexes.push(i);
  }
  if (indexes.length > 1) {
    let text = '';
    let doc = null;
    for (let i = indexes[0] + 1; i < indexes[1]; i++) {
      text += targetLines[i] + '\n';
    }
    try {
      doc = yaml.safeLoad(text);
    } catch (e) {
      console.error(e);
      doc = {
        __error: `${e.name}: ${e.reason}`
      };
    }
    return doc;
  }
  return null;
}

export function retriveContent(text) {
  const splitter = '---';
  const targetLines = text.split('\n');
  const indexes = [];
  const lineCount = targetLines.length;
  for (let i = 0; i < lineCount; i++) {
    if (targetLines[i] === splitter) indexes.push(i);
  }
  if (indexes.length > 1) {
    let text = '';
    for (let i = indexes[1] + 1; i < lineCount; i++) {
      text += targetLines[i] + (i === lineCount - 1 ? '' : '\n');
    }
    return text;
  }
  return '';
}

export function serializeObjtoYaml(obj) {
  return '---\n' + yaml.safeDump(obj) + '---\n';
}

export function parseFilenameFromYaml(text) {
  let doc = parseYamlInsideMarkdown(text);
  return doc ? doc.title : null;
}
