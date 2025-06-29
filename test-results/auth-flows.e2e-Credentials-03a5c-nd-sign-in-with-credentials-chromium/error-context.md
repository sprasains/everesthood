# Page snapshot

```yaml
- heading "Sign Up" [level=4]
- text: Name
- textbox "Name": E2E User
- text: Email
- textbox "Email": e2euser@example.com
- text: Password
- textbox "Password": e2epassword
- button
- button "Sign Up"
- paragraph:
  - text: Already have an account?
  - link "Sign in":
    - /url: /auth/signin
- alert
```