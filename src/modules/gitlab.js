import Gitlab from 'gitlab';
 
// Instantiating
const api = new Gitlab({
  //url:   'http://example.com', // Defaults to http://gitlab.com
  token: process.env.GITLAB_TOKEN
})