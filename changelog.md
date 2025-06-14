# 14 Jun 2025

- [x] Add query to fetch deployments
```ts
    query FetchDeployments {
  deployments(input: {
    projectId: "e0818fff-92ff-4d0c-bbd9-8df3848883ba"
  }) {
    edges {
      node {
        id
        staticUrl
        service {
          id
          name
        }
        creator {
          id
          name
        }
      }
    }
  }
}
```
    - [ ] Test run query and render
- [ ] Add mutation query to start container


- [ ] Add mutation query to stop container
```ts
mutation StopDeployment {
    deploymentStop(id: String)
}
```

- [ ] Create table UI to list containers
- [ ] Button to start and stop container
- [ ] View logs for starting and stopping container
- [ ] Add tetris for when for container to finish starting