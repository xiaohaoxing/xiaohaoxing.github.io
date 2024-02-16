---
title: 思维导图demo
date: 2020-07-26 19:20:23
tags:
---


<script>
const data = {
  label: "Central Topic",
  children: [
    {
      label: "Main Topic 1",
      children: [
        {
          label: "Main Topic 1"
        }
      ]
    },
    {
      label: "Main Topic 2"
    },
    {
      label: "Main Topic 3"
    }
  ]
}
</script>
 <GGEditor className="editor">
      <Mind className="editorBd" data={data} />
      <EditableLabel />
    </GGEditor>



``` mermaid
graph TD;
	A-->B;
	B-->C;
	A-->D;
```

