Get started with faas
-----------------------------------
Welcome to your new Node.js app!

Node.js app runs on a server-side high performance, highly scalable, event-driven environment with non-blocking I/O that is programmed with the JavaScript programming language.

1. [Install the cf command-line tool](https://www.stage1.ng.bluemix.net/docs/redirect.jsp?name=cf-instructions).
2. [Download the starter application package](https://ace.stage1.ng.bluemix.net:443/rest/../rest/apps/8d0bd8ec-9fc8-4980-8240-6bbeea53902d/starter-download)
3. Extract the package and `cd` to it.
4. Connect to BlueMix:

		cf api https://api.stage1.ng.bluemix.net

5. Log into BlueMix:

		cf login -u PETERHAN@ie.ibm.com
		cf target -o PETERHAN@ie.ibm.com -s dev

6. Deploy your app:

		cf push faas

7. Access your app: [faas.stage1.ng.bluemix.net](//faas.stage1.ng.bluemix.net)

