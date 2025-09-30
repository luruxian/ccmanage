<template>
  <div class="dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- 侧边栏 -->
        <div class="col-md-3 col-lg-2 sidebar">
          <div class="sidebar-content">
            <nav class="sidebar-nav">
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconVideoPlay /></ElIcon>
                安装Claude Code
              </router-link>
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconKey /></ElIcon>
                API密钥
              </router-link>
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconList /></ElIcon>
                订阅一览
              </router-link>
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconTrendCharts /></ElIcon>
                推广计划
              </router-link>
              <a href="#" @click="goToResourceCenter" :class="['nav-item', 'active']">
                <ElIcon><ElIconReading /></ElIcon>
                资料中心
              </a>
            </nav>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="col-md-9 col-lg-10 main-content">
          <div class="tab-content">
            <!-- 面包屑导航 -->
            <nav aria-label="breadcrumb" class="mb-4">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#" @click="goToResourceCenter">资料中心</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">Claude Code最佳实践</li>
              </ol>
            </nav>

            

            <!-- 页面内容暂时保持空白 -->
            <div class="best-practices-content">
              <ElCard>
                <div class="best-practices-article">
                  <div class="article-intro">
                    <h3>Claude Code最佳实践指南</h3>
                    <p class="intro-text">
                      Claude Code是一个用于代理式编程的命令行工具。本文介绍了在各种代码库、语言和环境中使用Claude Code的有效技巧和窍门。
                    </p>
                  </div>

                  <div class="article-content">
                    <section>
                      <p>
                        我们最近发布了Claude Code，这是一个用于代理式编程的命令行工具。作为一个研究项目开发，Claude Code为Anthropic的工程师和研究人员提供了一种更原生的方式来将Claude集成到他们的编程工作流程中。
                      </p>
                      <p>
                        Claude Code有意设计为低级别和不偏重任何特定方法，提供接近原始模型访问而不强制特定工作流程。这种设计理念创造了一个灵活、可定制、可脚本化和安全的强大工具。虽然功能强大，但这种灵活性对于初接触代理式编程工具的工程师来说存在学习曲线——至少在他们形成自己的最佳实践之前。
                      </p>
                      <p>
                        本文概述了经过验证有效的一般模式，适用于Anthropic内部团队和使用Claude Code的外部工程师。本列表中的内容并非一成不变或普遍适用；请将这些建议视为起点。我们鼓励您进行实验，找到最适合您的方法！
                      </p>
                      <p>
                        寻找更详细的信息？我们在claude.ai/code的综合文档涵盖了本文提到的所有功能，并提供了额外的示例、实现细节和高级技术。
                      </p>
                    </section>

                    <section>
                      <h4>1. 自定义您的设置</h4>
                      <p>Claude Code是一个自动将上下文拉入提示的代理式编程助手。这种上下文收集会消耗时间和令牌，但您可以通过环境调优来优化它。</p>

                      <h5>a. 创建CLAUDE.md文件</h5>
                      <p>CLAUDE.md是一个特殊文件，Claude在开始对话时会自动将其拉入上下文。这使其成为记录以下内容的理想位置：</p>
                      <ul>
                        <li>常用bash命令</li>
                        <li>核心文件和实用函数</li>
                        <li>代码风格指南</li>
                        <li>测试说明</li>
                        <li>仓库规范（例如，分支命名、合并vs变基等）</li>
                        <li>开发环境设置（例如，pyenv使用、哪些编译器有效）</li>
                        <li>项目特有的任何意外行为或警告</li>
                        <li>您希望Claude记住的其他信息</li>
                      </ul>

                      <p>CLAUDE.md文件没有必需的格式。我们建议保持简洁和人类可读。例如：</p>
                      <div class="code-example">
                        <pre># Bash commands
- npm run build: Build the project
- npm run typecheck: Run the typechecker

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

# Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance</pre>
                      </div>

                      <p>您可以将CLAUDE.md文件放在几个位置：</p>
                      <ul>
                        <li>您的仓库根目录，或运行claude的地方（最常见用法）</li>
                        <li>运行claude目录的任何父目录</li>
                        <li>运行claude目录的任何子目录</li>
                        <li>您的主文件夹（~/.claude/CLAUDE.md），适用于所有claude会话</li>
                      </ul>
                      <p>当您运行/init命令时，Claude会自动为您生成一个CLAUDE.md。</p>

                      <h5>b. 调优您的CLAUDE.md文件</h5>
                      <p>您的CLAUDE.md文件成为Claude提示的一部分，因此应该像任何经常使用的提示一样进行改进。一个常见错误是添加大量内容而不迭代其有效性。花时间实验并确定什么能从模型中产生最好的指令遵循效果。</p>
                      <p>您可以手动向CLAUDE.md添加内容，或按#键向Claude提供指令，它会自动将其纳入相关的CLAUDE.md中。许多工程师在编码时频繁使用#来记录命令、文件和样式指南，然后在提交中包含CLAUDE.md更改，以便团队成员也能受益。</p>

                      <p>在Anthropic，我们偶尔会通过提示改进器运行CLAUDE.md文件，并经常调整指令（例如添加"IMPORTANT"或"YOU MUST"的强调）来提高遵循性。</p>

                      <div class="image-container">
                        <img src="../assets/images/docs/3-1600x1231.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>c. 管理Claude的允许工具列表</h5>
                      <p>默认情况下，Claude Code对任何可能修改您系统的操作都会请求权限：文件写入、许多bash命令、MCP工具等。我们有意采用这种保守方法来优先考虑安全性。您可以自定义允许列表以允许您知道安全的额外工具。</p>

                      <p>管理允许工具有四种方式：</p>
                      <ol>
                        <li>在会话期间提示时选择"始终允许"</li>
                        <li>启动Claude Code后使用/permissions命令</li>
                        <li>手动编辑您的.claude/settings.json或~/.claude.json</li>
                        <li>使用--allowedTools CLI标志进行会话特定权限</li>
                      </ol>

                      <h5>d. 如果使用GitHub，安装gh CLI</h5>
                      <p>Claude知道如何使用gh CLI与GitHub交互，用于创建问题、打开拉取请求、阅读评论等。没有安装gh，Claude仍然可以使用GitHub API或MCP服务器。</p>
                    </section>

                    <section>
                      <h4>2. 为Claude提供更多工具</h4>
                      <p>Claude可以访问您的shell环境，您可以像为自己构建一样为它构建便利脚本和函数集。它还可以通过MCP和REST API利用更复杂的工具。</p>

                      <h5>a. 将Claude与bash工具一起使用</h5>
                      <p>Claude Code继承您的bash环境，使其能够访问您的所有工具。虽然Claude知道常见实用程序，但它不会知道您的自定义bash工具，除非有说明：</p>
                      <ul>
                        <li>告诉Claude工具名称和使用示例</li>
                        <li>告诉Claude运行--help查看工具文档</li>
                        <li>在CLAUDE.md中记录常用工具</li>
                      </ul>

                      <h5>b. 将Claude与MCP一起使用</h5>
                      <p>Claude Code既作为MCP服务器也作为客户端。作为客户端，它可以连接到任意数量的MCP服务器以通过三种方式访问其工具：</p>
                      <ul>
                        <li>在项目配置中（在该目录中运行Claude Code时可用）</li>
                        <li>在全局配置中（在所有项目中可用）</li>
                        <li>在检入的.mcp.json文件中（对在您代码库中工作的任何人都可用）</li>
                      </ul>
                      <p>When working with MCP, it can also be helpful to launch Claude with the --mcp-debug flag to help identify configuration issues.</p>
                      <h5>c. 使用自定义斜杠命令</h5>
                      <p>对于重复的工作流程——调试循环、日志分析等——将提示模板存储在.claude/commands文件夹内的Markdown文件中。当您键入/时，这些通过斜杠命令菜单变得可用。</p>
                      <p>
                        Custom slash commands can include the special keyword $ARGUMENTS to pass parameters from command invocation.

For example, here’s a slash command that you could use to automatically pull and fix a Github issue:
                      </p>
                      <div class="code-example">
                        <pre>Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
                        </pre>
                      </div>
                      <p>
                        Putting the above content into .claude/commands/fix-github-issue.md makes it available as the /project:fix-github-issue command in Claude Code. You could then for example use /project:fix-github-issue 1234 to have Claude fix issue #1234. Similarly, you can add your own personal commands to the ~/.claude/commands folder for commands you want available in all of your sessions.
                      </p>
                    </section>

                    <section>
                      <h4>3. 尝试常见工作流程</h4>
                      <p>Claude Code不强加特定工作流程，给您灵活使用的自由。在这种灵活性提供的空间内，已经出现了几种有效使用Claude Code的成功模式：</p>

                      <h5>a. 探索、规划、编码、提交</h5>
                      <p>这种多功能工作流程适合许多问题：</p>
                      <ol>
                        <li>Ask Claude to read relevant files, images, or URLs, providing either general pointers ("read the file that handles logging") or specific filenames ("read logging.py"), but explicitly tell it not to write any code just yet.
                          <ol>
                            <li>
                              This is the part of the workflow where you should consider strong use of subagents, especially for complex problems. Telling Claude to use subagents to verify details or investigate particular questions it might have, especially early on in a conversation or task, tends to preserve context availability without much downside in terms of lost efficiency.
                            </li>
                          </ol>
                        </li>
                        <li>
                          Ask Claude to make a plan for how to approach a specific problem. We recommend using the word "think" to trigger extended thinking mode, which gives Claude additional computation time to evaluate alternatives more thoroughly. These specific phrases are mapped directly to increasing levels of thinking budget in the system: "think" < "think hard" < "think harder" < "ultrathink." Each level allocates progressively more thinking budget for Claude to use.
                          <ol>
                            <li>
                              If the results of this step seem reasonable, you can have Claude create a document or a GitHub issue with its plan so that you can reset to this spot if the implementation (step 3) isn’t what you want.
                            </li>
                          </ol>
                        </li>
                        <li>Ask Claude to implement its solution in code. This is also a good place to ask it to explicitly verify the reasonableness of its solution as it implements pieces of the solution.</li>
                        <li>Ask Claude to commit the result and create a pull request. If relevant, this is also a good time to have Claude update any READMEs or changelogs with an explanation of what it just did.</li>
                      </ol>
                      <p>Steps #1-#2 are crucial—without them, Claude tends to jump straight to coding a solution. While sometimes that's what you want, asking Claude to research and plan first significantly improves performance for problems requiring deeper thinking upfront.</p>
                      <h5>b. 编写测试、提交；编码、迭代、提交</h5>
                      <p>这是Anthropic最喜欢的工作流程，用于可以通过单元、集成或端到端测试轻松验证的更改。测试驱动开发（TDD）与代理式编程变得更加强大。</p>
                      <ol>
                        <li>
                          Ask Claude to write tests based on expected input/output pairs. Be explicit about the fact that you’re doing test-driven development so that it avoids creating mock implementations, even for functionality that doesn’t exist yet in the codebase.
                        </li>
                        <li>
                          Tell Claude to run the tests and confirm they fail. Explicitly telling it not to write any implementation code at this stage is often helpful.
                        </li>
                        <li>
                          Ask Claude to commit the tests when you’re satisfied with them.
                        </li>
                        <li>
                          Ask Claude to write code that passes the tests, instructing it not to modify the tests. Tell Claude to keep going until all tests pass. It will usually take a few iterations for Claude to write code, run the tests, adjust the code, and run the tests again.
                          <ol>
                            <li>At this stage, it can help to ask it to verify with independent subagents that the implementation isn’t overfitting to the tests</li>
                          </ol>
                        </li>
                        <li>Ask Claude to commit the code once you’re satisfied with the changes.</li>
                      </ol>
                      <p>Claude performs best when it has a clear target to iterate against—a visual mock, a test case, or another kind of output. By providing expected outputs like tests, Claude can make changes, evaluate results, and incrementally improve until it succeeds.</p>


                      <h5>c. 编写代码、截图结果、迭代</h5>
                      <p>类似于测试工作流程，您可以为Claude提供视觉目标，通过浏览器截图、设计模拟等方式进行迭代改进。</p>
                      <ol>
                        <li>
                          Give Claude a way to take browser screenshots (e.g., with the Puppeteer MCP server, an iOS simulator MCP server, or manually copy / paste screenshots into Claude).
                        </li>
                        <li>
                          Give Claude a visual mock by copying / pasting or drag-dropping an image, or giving Claude the image file path.
                        </li>
                        <li>
Ask Claude to implement the design in code, take screenshots of the result, and iterate until its result matches the mock.
                        </li>
                        <li>
Ask Claude to commit when you're satisfied.
                        </li>
                      </ol>
                      <p>Like humans, Claude's outputs tend to improve significantly with iteration. While the first version might be good, after 2-3 iterations it will typically look much better. Give Claude the tools to see its outputs for best results.

</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/1-1600x1143.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>d. 安全YOLO模式</h5>
                      <p>Instead of supervising Claude, you can use claude --dangerously-skip-permissions to bypass all permission checks and let Claude work uninterrupted until completion. This works well for workflows like fixing lint errors or generating boilerplate code.

Letting Claude run arbitrary commands is risky and can result in data loss, system corruption, or even data exfiltration (e.g., via prompt injection attacks). To minimize these risks, use --dangerously-skip-permissions in a container without internet access. You can follow this reference implementation using Docker Dev Containers.</p>

                      <h5>e. 代码库问答</h5>
                      <p>When onboarding to a new codebase, use Claude Code for learning and exploration. You can ask Claude the same sorts of questions you would ask another engineer on the project when pair programming. Claude can agentically search the codebase to answer general questions like:</p>
                      <ol>
                        <li>
How does logging work?
                        </li>
                         <li>
                          How do I make a new API endpoint? 
                        </li>
                         <li>
                          What does async move { ... } do on line 134 of foo.rs?
                        </li>
                         <li>
                          What edge cases does CustomerOnboardingFlowImpl handle?
                        </li>
                         <li>
                          Why are we calling foo() instead of bar() on line 333?
                        </li>
                         <li>
                          What’s the equivalent of line 334 of baz.py in Java?
                        </li>
                      </ol>
                      <p>
                        At Anthropic, using Claude Code in this way has become our core onboarding workflow, significantly improving ramp-up time and reducing load on other engineers. No special prompting is required! Simply ask questions, and Claude will explore the code to find answers.
                      </p>
                      <div class="image-container">
                        <img src="../assets/images/docs/5-1600x1278.png" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>f. 使用Claude与git交互</h5>
                      <p>Claude can effectively handle many git operations. Many Anthropic engineers use Claude for 90%+ of our git interactions:</p>
                      <ol>
                        <li>
Searching git history to answer questions like "What changes made it into v1.2.3?", "Who owns this particular feature?", or "Why was this API designed this way?" It helps to explicitly prompt Claude to look through git history to answer queries like these.
                        </li>
                        <li>
                         Writing commit messages. Claude will look at your changes and recent history automatically to compose a message taking all the relevant context into account 
                        </li>
                        <li>
                          Handling complex git operations like reverting files, resolving rebase conflicts, and comparing and grafting patches
                        </li>
                      </ol>
                      <h5>g. 使用Claude与GitHub交互</h5>
                      <p>Claude Code可以管理许多GitHub交互，包括创建拉取请求、实现代码审查评论的一次性解决方案等。</p>
                      <ol>
                        <li>
                          Creating pull requests: Claude understands the shorthand "pr" and will generate appropriate commit messages based on the diff and surrounding context.
                        </li>
                        <li>
                          Implementing one-shot resolutions for simple code review comments: just tell it to fix comments on your PR (optionally, give it more specific instructions) and push back to the PR branch when it's done.
                        </li>
                        <li>
                          Fixing failing builds or linter warnings
                        </li>
                        <li>
                          Categorizing and triaging open issues by asking Claude to loop over open GitHub issues
                        </li>
                      </ol>
                      <p>This eliminates the need to remember gh command line syntax while automating routine tasks.</p>
                      <h5>h. 使用Claude处理Jupyter笔记本</h5>
                      <p>Researchers and data scientists at Anthropic use Claude Code to read and write Jupyter notebooks. Claude can interpret outputs, including images, providing a fast way to explore and interact with data. There are no required prompts or workflows, but a workflow we recommend is to have Claude Code and a .ipynb file open side-by-side in VS Code.</p>
                      <p>You can also ask Claude to clean up or make aesthetic improvements to your Jupyter notebook before you show it to colleagues. Specifically telling it to make the notebook or its data visualizations “aesthetically pleasing” tends to help remind it that it’s optimizing for a human viewing experience.</p>
                    </section>

                    <section>
                      <h4>4. 优化您的工作流程</h4>
                      <p>以下建议适用于所有工作流程：</p>

                      <h5>a. 在指令中要具体</h5>
                      <p>Claude Code的成功率随着更具体的指令显著提高，特别是在首次尝试时。提前给出明确方向减少了后期过程修正的需要。</p>
                      <p>For example:</p>
                      <div class="code-example">
                        <table>
                          <thead>
                            <tr>
                              <th>Poor</th>
                              <th>Good</th>
                            </tr>
                          </thead>
                          <tbody>

                            <tr>
                              <td>add tests for foo.py</td>
                              <td>write a new test case for foo.py, covering the edge case where the user is logged out. avoid mocks</td>
                            </tr>
                            <tr>
                              <td>why does ExecutionFactory have such a weird api?</td>
                              <td>look through ExecutionFactory's git history and summarize how its api came to be</td>
                            </tr>
                            <tr>
                              <td>add a calendar widget</td>
                              <td>look at how existing widgets are implemented on the home page to understand the patterns and specifically how code and interfaces are separated out. HotDogWidget.php is a good example to start with. then, follow the pattern to implement a new calendar widget that lets the user select a month and paginate forwards/backwards to pick a year. Build from scratch without libraries other than the ones already used in the rest of the codebase.</td>
                            </tr>
                          </tbody>
                        </table>
                        
                      </div>
                      <p>Claude can infer intent, but it can't read minds. Specificity leads to better alignment with expectations.</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/2-1360x1126.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>b. 给Claude图像</h5>
                      <p>Claude excels with images and diagrams through several methods:</p>
                      <ol>
                        <li>
                          Paste screenshots (pro tip: hit cmd+ctrl+shift+4 in macOS to screenshot to clipboard and ctrl+v to paste. Note that this is not cmd+v like you would usually use to paste on mac and does not work remotely.)
                        </li>
                        <li>
                          Drag and drop images directly into the prompt input
                        </li>
                        <li>
                          Provide file paths for images
                        </li>
                      </ol>
                      <p>This is particularly useful when working with design mocks as reference points for UI development, and visual charts for analysis and debugging. If you are not adding visuals to context, it can still be helpful to be clear with Claude about how important it is for the result to be visually appealing.</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/4-1450x1164.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>c. 提及您希望Claude查看或处理的文件</h5>
                      <p>Use tab-completion to quickly reference files or folders anywhere in your repository, helping Claude find or update the right resources.</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/6-1306x1088.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>


                      <h5>d. 给Claude URL</h5>
                      <p>Paste specific URLs alongside your prompts for Claude to fetch and read. To avoid permission prompts for the same domains (e.g., docs.foo.com), use /permissions to add domains to your allowlist.</p>

                      <h5>e. 及早和经常进行过程修正</h5>
                      <p>While auto-accept mode (shift+tab to toggle) lets Claude work autonomously, you'll typically get better results by being an active collaborator and guiding Claude's approach. You can get the best results by thoroughly explaining the task to Claude at the beginning, but you can also course correct Claude at any time. For example, if Claude gets stuck on a part of the task, you can ask it to explain the problem and then try to fix it. You can also ask Claude to use a different approach if it's not working as expected.</p>
                      <p>
                        These four tools help with course correction:
                      </p>
                      <ol>
                        <li>Ask Claude to make a plan before coding. Explicitly tell it not to code until you’ve confirmed its plan looks good.</li>
                        <li>
                          Press Escape to interrupt Claude during any phase (thinking, tool calls, file edits), preserving context so you can redirect or expand instructions.
                        </li>
                        <li>
                          Double-tap Escape to jump back in history, edit a previous prompt, and explore a different direction. You can edit the prompt and repeat until you get the result you're looking for.
                        </li>
                        <li>
                          Ask Claude to undo changes, often in conjunction with option #2 to take a different approach.
                        </li>
                      </ol>
                      <p>
                        Though Claude Code occasionally solves problems perfectly on the first attempt, using these correction tools generally produces better solutions faster.
                      </p>

                      <h5>f. 使用/clear保持上下文专注</h5>
                      <p>在长会话期间，Claude的上下文窗口可能会被无关的对话、文件内容和命令填满。在任务之间频繁使用/clear命令重置上下文窗口。</p>

                      <h5>g. 为复杂工作流程使用检查清单和草稿本</h5>
                      <p>For large tasks with multiple steps or requiring exhaustive solutions—like code migrations, fixing numerous lint errors, or running complex build scripts—improve performance by having Claude use a Markdown file (or even a GitHub issue!) as a checklist and working scratchpad:</p>
                      <p>
                        For example, to fix a large number of lint issues, you can do the following:
                      </p>
                      <ol>
                        <li>Tell Claude to run the lint command and write all resulting errors (with filenames and line numbers) to a Markdown checklist</li>
                        <li>Instruct Claude to address each issue one by one, fixing and verifying before checking it off and moving to the next</li>
                      </ol>

                      <h5>h. 将数据传递给Claude</h5>
                      <p>Several methods exist for providing data to Claude:</p>
                      <ol>
                        <li>Copy and paste directly into your prompt (most common approach)</li> 
                        <li>Pipe into Claude Code (e.g., cat foo.txt | claude), particularly useful for logs, CSVs, and large data</li>
                        <li>Tell Claude to pull data via bash commands, MCP tools, or custom slash commands</li>
                        <li>Ask Claude to read files or fetch URLs (works for images too)</li>
                      </ol>
                      <p>
                        Most sessions involve a combination of these approaches. For example, you can pipe in a log file, then tell Claude to use a tool to pull in additional context to debug the logs.
                      </p>
                    </section>

                    <section>
                      <h4>5. 使用无头模式自动化您的基础设施</h4>
                      <p>Claude Code includes headless mode for non-interactive contexts like CI, pre-commit hooks, build scripts, and automation. Use the -p flag with a prompt to enable headless mode, and --output-format stream-json for streaming JSON output.</p>
                      <p>Note that headless mode does not persist between sessions. You have to trigger it each session.</p>
                      <h5>a. 使用Claude进行问题分类</h5>
                      <p>Headless mode can power automations triggered by GitHub events, such as when a new issue is created in your repository. For example, the public Claude Code repository uses Claude to inspect new issues as they come in and assign appropriate labels.</p>

                      <h5>b. 使用Claude作为代码检查器</h5>
                      <p>Claude Code can provide subjective code reviews beyond what traditional linting tools detect, identifying issues like typos, stale comments, misleading function or variable names, and more.</p>
                    </section>

                    <section>
                      <h4>6. 通过多Claude工作流程提升</h4>
                      <p>除了独立使用外，一些最强大的应用涉及并行运行多个Claude实例：</p>

                      <h5>a. 让一个Claude编写代码；使用另一个Claude验证</h5>
                      <p>A simple but effective approach is to have one Claude write code while another reviews or tests it. Similar to working with multiple engineers, sometimes having separate context is beneficial:</p>
                      <ol>
                        <li>Use Claude to write code</li>
                        <li>Run /clear or start a second Claude in another terminal</li>
                        <li>Have the second Claude review the first Claude's work</li>
                        <li>Start another Claude (or /clear again) to read both the code and review feedback</li>
                        <li>Have this Claude edit the code based on the feedback</li>
                      </ol>
                      <p>
                        You can do something similar with tests: have one Claude write tests, then have another Claude write code to make the tests pass. You can even have your Claude instances communicate with each other by giving them separate working scratchpads and telling them which one to write to and which one to read from.
                      </p>
                      <p>This separation often yields better results than having a single Claude handle everything.
                      </p>
                      <h5>b. 拥有仓库的多个检出</h5>
                      <p>Rather than waiting for Claude to complete each step, something many engineers at Anthropic do is:</p>
                      <ol>
                        <li>Create 3-4 git checkouts in separate folders</li>
                        <li>Open each folder in separate terminal tabs</li>
                        <li>Start Claude in each folder with different tasks</li>
                        <li>Cycle through to check progress and approve/deny permission requests</li>
                      </ol>
                      <h5>c. 使用git worktrees</h5>
                      <p>This approach shines for multiple independent tasks, offering a lighter-weight alternative to multiple checkouts. Git worktrees allow you to check out multiple branches from the same repository into separate directories. Each worktree has its own working directory with isolated files, while sharing the same Git history and reflog.</p>
                      <p>Using git worktrees enables you to run multiple Claude sessions simultaneously on different parts of your project, each focused on its own independent task. For instance, you might have one Claude refactoring your authentication system while another builds a completely unrelated data visualization component. Since the tasks don't overlap, each Claude can work at full speed without waiting for the other's changes or dealing with merge conflicts:</p>
                      <ol>
                        <li>Create worktrees: git worktree add ../project-feature-a feature-a
                        </li>
                        <li>Launch Claude in each worktree: cd ../project-feature-a && claude
                        </li>
                        <li>Create additional worktrees as needed (repeat steps 1-2 in new terminal tabs)
                        </li>
                      </ol>
                      <p>Some tips:</p>
                      <ol>
                        <li>Use consistent naming conventions
                        </li>
                        <li>Maintain one terminal tab per worktree
                        </li>
                        <li>If you’re using iTerm2 on Mac, set up notifications for when Claude needs attention
                        </li>
                        <li>Use separate IDE windows for different worktrees
                        </li>
                        <li>Clean up when finished: git worktree remove ../project-feature-a
                        </li>
                      </ol>
                      <h5>d. 使用带有自定义工具的无头模式</h5>
                      <p>claude -p（无头模式）将Claude Code程序化集成到更大的工作流程中，同时利用其内置工具和系统提示。</p>
                      <ol>
                        <li>Fanning out handles large migrations or analyses (e.g., analyzing sentiment in hundreds of logs or analyzing thousands of CSVs):
                          <ol>
                            <li>
Have Claude write a script to generate a task list. For example, generate a list of 2k files that need to be migrated from framework A to framework B.
                            </li>
                            <li>
                              Loop through tasks, calling Claude programmatically for each and giving it a task and a set of tools it can use. For example: claude -p “migrate foo.py from React to Vue. When you are done, you MUST return the string OK if you succeeded, or FAIL if the task failed.” --allowedTools Edit Bash(git commit:*)
                            </li>
                            <li>
                              Run the script several times and refine your prompt to get the desired outcome.
                            </li>
                          </ol>
                        </li>
                        <li>Pipelining integrates Claude into existing data/processing pipelines:
                           <ol>
                            <li>Call claude -p “your prompt” --json | your_command, where your_command is the next step of your processing pipeline
                            </li>
                            <li>
                              That’s it! JSON output (optional) can help provide structure for easier automated processing.
                            </li>
                          </ol>
                        </li>
                      </ol>
                      <p>For both of these use cases, it can be helpful to use the --verbose flag for debugging the Claude invocation. We generally recommend turning verbose mode off in production for cleaner output.
                      </p>
                      <p>What are your tips and best practices for working with Claude Code? Tag @AnthropicAI so we can see what you're building!</p>
                    </section>

                    <section>
                      <h4>致谢</h4>
                      <p>
                        作者：Boris Cherny。这项工作借鉴了更广泛的Claude Code用户社区的最佳实践，他们的创造性方法和工作流程继续启发着我们。特别感谢Daisy Hollman、Ashwin Bhat、Cat Wu、Sid Bidasaria、Cal Rueb、Nodir Turakulov、Barry Zhang、Drew Hodun和许多其他Anthropic工程师，他们宝贵的见解和Claude Code的实际经验帮助塑造了这些建议。
                      </p>
                    </section>
                  </div>
                </div>
              </ElCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElIcon, ElCard } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  VideoPlay as ElIconVideoPlay,
  Key as ElIconKey,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  Reading as ElIconReading
} from '@element-plus/icons-vue'

const router = useRouter()

const goToResourceCenter = () => {
  router.push('/dashboard?tab=resources')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  background: white;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  min-height: 100vh;
  padding: 0;
}

.sidebar-content {
  padding: 30px 20px;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-nav .nav-item:hover,
.sidebar-nav .nav-item.active {
  background: #409eff;
  color: white;
}

.sidebar-nav .nav-item .el-icon {
  margin-right: 10px;
}

.main-content {
  padding: 30px;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 1rem;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.best-practices-content {
  margin-top: 20px;
}

.best-practices-article {
  padding: 30px;
  line-height: 1.8;
  font-size: 15px;
  color: #2c3e50;
}

.article-intro {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 2px solid #ecf0f1;
}

.article-intro h3 {
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
}

.intro-text {
  font-size: 18px;
  color: #34495e;
  text-align: center;
  font-weight: 500;
  margin: 0;
}

.article-content section {
  margin-bottom: 40px;
}

.article-content h4 {
  color: #2980b9;
  font-size: 22px;
  font-weight: 600;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #3498db;
}

.article-content h5 {
  color: #34495e;
  font-size: 18px;
  font-weight: 600;
  margin: 25px 0 15px 0;
}

.article-content p {
  margin-bottom: 16px;
  text-align: justify;
}

.article-content ul, .article-content ol {
  margin: 16px 0;
  padding-left: 25px;
}

.article-content li {
  margin-bottom: 8px;
}

.code-example {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 20px 0;
  overflow: hidden;
}

.code-example pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
}

.image-container {
  text-align: center;
  margin: 30px 0;
}

.practice-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.empty-content {
  text-align: center;
  padding: 60px 20px;
}

.empty-content .el-icon {
  margin-bottom: 16px;
}

.tab-content {
  background: transparent;
}

h2 {
  color: #2c3e50;
  font-weight: 600;
}
</style>