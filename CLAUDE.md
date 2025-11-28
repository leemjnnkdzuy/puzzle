# Rules: Git commit messages

When you generate a git commit message, ALWAYS follow these rules:

1. Use Conventional Commits format:

    - `<type>(<scope>): <subject>`

2. Allowed types:

    - `feat` : thêm chức năng mới
    - `fix` : sửa bug
    - `docs` : tài liệu, README, comment
    - `style` : format, UI, không đổi logic
    - `refactor`: chỉnh lại code, tối ưu, không thêm feature
    - `test` : thêm/sửa test
    - `chore` : việc lặt vặt, config, build, không đổi logic
    - `build` : thay đổi hệ thống build, tool, deps
    - `ci` : thay đổi CI/CD

3. Scope:

    - `(<scope>)` là tùy chọn, nhưng khuyến khích.
    - Scope nên là tên module / folder / feature, viết thường, không dấu.
    - Ví dụ: `auth`, `cart`, `api`, `ui`, `db`, `config`.

4. Subject:

    - Viết ngắn gọn, tối đa ~72 ký tự.
    - Không viết hoa toàn bộ, không chấm ở cuối.
    - Dùng câu mệnh lệnh (imperative), ví dụ:
        - `feat(auth): add login with google`
        - `fix(cart): handle empty cart case`
        - `refactor(api): split user service`

5. Body (nếu cần):

    - Mô tả chi tiết hơn về _what_ & _why_, không phải _how_.
    - Dùng tiếng Anh hoặc tiếng Việt, nhưng rõ ràng.
    - Có thể dùng bullet:
        - `- change 1`
        - `- change 2`

6. Breaking changes:

    - Nếu có breaking change, thêm đoạn dưới body:
        - `BREAKING CHANGE: <mô tả>`
    - Ví dụ:
        - `BREAKING CHANGE: remove legacy login endpoint`

7. Issue / ticket:

    - Nếu có link tới task / issue, thêm ở cuối:
        - `Refs: #123` hoặc `Closes: #123`.

8. Examples:
    - `feat(game): add pokemon match timer`
    - `fix(api): validate user token before match`
    - `docs(readme): update setup instructions`
    - `chore(config): update eslint and prettier`
    - `refactor(ui): extract button component`
