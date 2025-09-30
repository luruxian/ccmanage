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
                        <pre># Bash命令
- npm run build: 构建项目
- npm run typecheck: 运行类型检查器

# 代码风格
- 使用ES模块 (import/export) 语法，而不是CommonJS (require)
- 尽可能使用解构导入 (例如 import { foo } from 'bar')

# 工作流程
- 在完成一系列代码更改后务必进行类型检查
- 为了性能考虑，优先运行单个测试，而不是整个测试套件</pre>
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
                      <p>在使用MCP时，使用--mcp-debug标志启动Claude来帮助识别配置问题也会很有帮助。</p>
                      <h5>c. 使用自定义斜杠命令</h5>
                      <p>对于重复的工作流程——调试循环、日志分析等——将提示模板存储在.claude/commands文件夹内的Markdown文件中。当您键入/时，这些通过斜杠命令菜单变得可用。</p>
                      <p>
                        自定义斜杠命令可以包含特殊关键字$ARGUMENTS来从命令调用传递参数。

例如，这是一个您可以用来自动拉取和修复Github问题的斜杠命令：
                      </p>
                      <div class="code-example">
                        <pre>请分析并修复GitHub问题：$ARGUMENTS。

按照以下步骤操作：

1. 使用`gh issue view`获取问题详情
2. 理解问题中描述的问题
3. 搜索代码库中的相关文件
4. 实施必要的更改来修复问题
5. 编写并运行测试来验证修复
6. 确保代码通过linting和类型检查
7. 创建描述性提交消息
8. 推送并创建PR

记住使用GitHub CLI (`gh`)进行所有与GitHub相关的任务。
                        </pre>
                      </div>
                      <p>
                        将上述内容放入.claude/commands/fix-github-issue.md中，使其在Claude Code中作为/project:fix-github-issue命令可用。然后您可以例如使用/project:fix-github-issue 1234让Claude修复问题#1234。同样，您可以将自己的个人命令添加到~/.claude/commands文件夹中，用于您希望在所有会话中可用的命令。
                      </p>
                    </section>

                    <section>
                      <h4>3. 尝试常见工作流程</h4>
                      <p>Claude Code不强加特定工作流程，给您灵活使用的自由。在这种灵活性提供的空间内，已经出现了几种有效使用Claude Code的成功模式：</p>

                      <h5>a. 探索、规划、编码、提交</h5>
                      <p>这种多功能工作流程适合许多问题：</p>
                      <ol>
                        <li>要求Claude阅读相关文件、图像或URL，提供一般性指向（如"阅读处理日志记录的文件"）或特定文件名（如"阅读logging.py"），但明确告诉它暂时不要编写任何代码。
                          <ol>
                            <li>
                              这是工作流程中您应该考虑大量使用子代理的部分，特别是对于复杂问题。告诉Claude使用子代理来验证细节或调查它可能有的特定问题，尤其是在对话或任务的早期阶段，往往能在不降低效率的情况下保持上下文的可用性。
                            </li>
                          </ol>
                        </li>
                        <li>
                          要求Claude制定解决特定问题的计划。我们建议使用"think"这个词来触发扩展思考模式，这给Claude额外的计算时间来更彻底地评估替代方案。这些特定短语直接映射到系统中递增的思考预算级别："think" < "think hard" < "think harder" < "ultrathink"。每个级别为Claude分配递增的思考预算。
                          <ol>
                            <li>
                              如果这一步的结果看起来合理，您可以让Claude创建一个文档或GitHub问题来记录其计划，这样如果实现（第3步）不是您想要的，您可以重置到这个位置。
                            </li>
                          </ol>
                        </li>
                        <li>要求Claude在代码中实现其解决方案。这也是要求它在实现解决方案的各个部分时明确验证其合理性的好地方。</li>
                        <li>要求Claude提交结果并创建拉取请求。如果相关的话，这也是让Claude更新任何README或变更日志，解释它刚才做了什么的好时机。</li>
                      </ol>
                      <p>步骤#1-#2是至关重要的——没有它们，Claude往往会直接跳到编码解决方案。虽然有时这就是您想要的，但首先要求Claude进行研究和规划，对于需要前期深入思考的问题，会显著提高性能。</p>
                      <h5>b. 编写测试、提交；编码、迭代、提交</h5>
                      <p>这是Anthropic最喜欢的工作流程，用于可以通过单元、集成或端到端测试轻松验证的更改。测试驱动开发（TDD）与代理式编程变得更加强大。</p>
                      <ol>
                        <li>
                          要求Claude基于预期的输入/输出对编写测试。明确说明您正在进行测试驱动开发，这样它就不会创建模拟实现，即使对于代码库中尚不存在的功能也是如此。
                        </li>
                        <li>
                          告诉Claude运行测试并确认它们失败。明确告诉它在这个阶段不要编写任何实现代码通常是有帮助的。
                        </li>
                        <li>
                          当您对测试满意时，要求Claude提交测试。
                        </li>
                        <li>
                          要求Claude编写通过测试的代码，指示它不要修改测试。告诉Claude继续进行，直到所有测试都通过。Claude通常需要几次迭代来编写代码、运行测试、调整代码，然后再次运行测试。
                          <ol>
                            <li>在这个阶段，要求它使用独立的子代理验证实现没有过度拟合测试可能会有帮助</li>
                          </ol>
                        </li>
                        <li>一旦您对更改满意，要求Claude提交代码。</li>
                      </ol>
                      <p>当Claude有明确的迭代目标时表现最佳——视觉模拟、测试用例或其他类型的输出。通过提供测试等预期输出，Claude可以进行更改、评估结果，并逐步改进直到成功。</p>


                      <h5>c. 编写代码、截图结果、迭代</h5>
                      <p>类似于测试工作流程，您可以为Claude提供视觉目标，通过浏览器截图、设计模拟等方式进行迭代改进。</p>
                      <ol>
                        <li>
                          为Claude提供截取浏览器截图的方法（例如，使用Puppeteer MCP服务器、iOS模拟器MCP服务器，或手动复制/粘贴截图到Claude中）。
                        </li>
                        <li>
                          通过复制/粘贴或拖拽图像，或提供图像文件路径，为Claude提供视觉模拟。
                        </li>
                        <li>
要求Claude在代码中实现设计，截取结果截图，并迭代直到其结果与模拟匹配。
                        </li>
                        <li>
当您满意时要求Claude提交。
                        </li>
                      </ol>
                      <p>像人类一样，Claude的输出往往会随着迭代而显著改善。虽然第一个版本可能不错，但经过2-3次迭代后通常会看起来好得多。为Claude提供查看其输出的工具以获得最佳结果。

</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/1-1600x1143.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>d. 安全YOLO模式</h5>
                      <p>您可以使用claude --dangerously-skip-permissions来绕过所有权限检查，让Claude不受干扰地工作直至完成，而不是监督Claude。这对于修复lint错误或生成样板代码等工作流程效果很好。

让Claude运行任意命令是有风险的，可能导致数据丢失、系统损坏，甚至数据泄露（例如，通过提示注入攻击）。为了最小化这些风险，请在没有互联网访问的容器中使用--dangerously-skip-permissions。您可以遵循这个使用Docker开发容器的参考实现。</p>

                      <h5>e. 代码库问答</h5>
                      <p>在适应新代码库时，使用Claude Code进行学习和探索。您可以向Claude询问在结对编程时会向项目中其他工程师询问的同类问题。Claude可以代理式地搜索代码库来回答一般性问题，如：</p>
                      <ol>
                        <li>
日志记录是如何工作的？
                        </li>
                         <li>
                          如何创建新的API端点？
                        </li>
                         <li>
                          foo.rs第134行的async move { ... }是做什么的？
                        </li>
                         <li>
                          CustomerOnboardingFlowImpl处理哪些边缘情况？
                        </li>
                         <li>
                          为什么我们在第333行调用foo()而不是bar()？
                        </li>
                         <li>
                          baz.py第334行在Java中的等价物是什么？
                        </li>
                      </ol>
                      <p>
                        在Anthropic，以这种方式使用Claude Code已经成为我们的核心入职工作流程，显著改善了上手时间并减少了其他工程师的负担。不需要特殊的提示！只需提问，Claude就会探索代码来寻找答案。
                      </p>
                      <div class="image-container">
                        <img src="../assets/images/docs/5-1600x1278.png" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>f. 使用Claude与git交互</h5>
                      <p>Claude可以有效处理许多git操作。许多Anthropic工程师使用Claude进行90%以上的git交互：</p>
                      <ol>
                        <li>
搜索git历史记录来回答诸如"哪些更改进入了v1.2.3？"、"谁拥有这个特定功能？"或"为什么这个API是这样设计的？"等问题。明确提示Claude查看git历史记录来回答这类查询会有帮助。
                        </li>
                        <li>
                         编写提交消息。Claude会自动查看您的更改和最近的历史记录，考虑所有相关上下文来编写消息
                        </li>
                        <li>
                          处理复杂的git操作，如还原文件、解决变基冲突、比较和移植补丁
                        </li>
                      </ol>
                      <h5>g. 使用Claude与GitHub交互</h5>
                      <p>Claude Code可以管理许多GitHub交互，包括创建拉取请求、实现代码审查评论的一次性解决方案等。</p>
                      <ol>
                        <li>
                          创建拉取请求：Claude理解"pr"这个简写，并会基于差异和周围上下文生成适当的提交消息。
                        </li>
                        <li>
                          为简单的代码审查评论实现一次性解决方案：只需告诉它修复您PR上的评论（可选地，给它更具体的指令），完成后推送到PR分支。
                        </li>
                        <li>
                          修复失败的构建或linter警告
                        </li>
                        <li>
                          通过要求Claude循环遍历开放的GitHub问题来分类和处理开放问题
                        </li>
                      </ol>
                      <p>这消除了记住gh命令行语法的需要，同时自动化了常规任务。</p>
                      <h5>h. 使用Claude处理Jupyter笔记本</h5>
                      <p>Anthropic的研究人员和数据科学家使用Claude Code来读写Jupyter笔记本。Claude可以解释输出，包括图像，提供快速探索和与数据交互的方式。没有必需的提示或工作流程，但我们推荐的工作流程是在VS Code中并排打开Claude Code和.ipynb文件。</p>
                      <p>您还可以要求Claude在向同事展示之前清理或美化您的Jupyter笔记本。特别告诉它让笔记本或其数据可视化"美观"往往有助于提醒它为人类观看体验进行优化。</p>
                    </section>

                    <section>
                      <h4>4. 优化您的工作流程</h4>
                      <p>以下建议适用于所有工作流程：</p>

                      <h5>a. 在指令中要具体</h5>
                      <p>Claude Code的成功率随着更具体的指令显著提高，特别是在首次尝试时。提前给出明确方向减少了后期过程修正的需要。</p>
                      <p>例如：</p>
                      <div class="code-example">
                        <table>
                          <thead>
                            <tr>
                              <th>差的</th>
                              <th>好的</th>
                            </tr>
                          </thead>
                          <tbody>

                            <tr>
                              <td>为foo.py添加测试</td>
                              <td>为foo.py编写新的测试用例，覆盖用户已登出的边缘情况。避免使用模拟</td>
                            </tr>
                            <tr>
                              <td>为什么ExecutionFactory有如此奇怪的api？</td>
                              <td>查看ExecutionFactory的git历史记录并总结其api是如何形成的</td>
                            </tr>
                            <tr>
                              <td>添加日历小部件</td>
                              <td>查看主页上现有小部件的实现方式以了解模式，特别是代码和接口是如何分离的。HotDogWidget.php是一个很好的起点。然后，遵循模式实现一个新的日历小部件，让用户选择月份并向前/向后翻页选择年份。从头构建，除了代码库其余部分已使用的库外，不使用其他库。</td>
                            </tr>
                          </tbody>
                        </table>

                      </div>
                      <p>Claude可以推断意图，但它无法读心术。具体性能带来与期望更好的一致性。</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/2-1360x1126.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>b. 给Claude图像</h5>
                      <p>Claude通过几种方法在图像和图表方面表现出色：</p>
                      <ol>
                        <li>
                          粘贴截图（专业提示：在macOS中按cmd+ctrl+shift+4截图到剪贴板，然后按ctrl+v粘贴。注意这不是您通常在mac上粘贴时使用的cmd+v，并且不适用于远程连接。）
                        </li>
                        <li>
                          将图像直接拖放到提示输入中
                        </li>
                        <li>
                          提供图像的文件路径
                        </li>
                      </ol>
                      <p>这在使用设计模拟作为UI开发的参考点，以及使用视觉图表进行分析和调试时特别有用。如果您没有向上下文添加视觉元素，向Claude明确说明结果的视觉吸引力有多重要仍然会有帮助。</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/4-1450x1164.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>
                      <h5>c. 提及您希望Claude查看或处理的文件</h5>
                      <p>使用制表符补全快速引用仓库中任何位置的文件或文件夹，帮助Claude找到或更新正确的资源。</p>
                      <div class="image-container">
                        <img src="../assets/images/docs/6-1306x1088.webp" alt="Claude Code Best Practices" class="practice-image" />
                      </div>


                      <h5>d. 给Claude URL</h5>
                      <p>在您的提示中粘贴特定的URL，让Claude获取和阅读。为了避免相同域名（例如docs.foo.com）的权限提示，使用/permissions将域名添加到您的允许列表中。</p>

                      <h5>e. 及早和经常进行过程修正</h5>
                      <p>虽然自动接受模式（shift+tab切换）让Claude自主工作，但通过成为积极的协作者并指导Claude的方法，您通常会获得更好的结果。您可以通过在开始时彻底向Claude解释任务来获得最佳结果，但您也可以随时对Claude进行过程修正。例如，如果Claude在任务的某一部分卡住了，您可以要求它解释问题然后尝试修复。如果没有按预期工作，您也可以要求Claude使用不同的方法。</p>
                      <p>
                        这四个工具有助于过程修正：
                      </p>
                      <ol>
                        <li>要求Claude在编码前制定计划。明确告诉它在您确认其计划看起来不错之前不要编码。</li>
                        <li>
                          在任何阶段（思考、工具调用、文件编辑）按Escape键中断Claude，保留上下文以便您可以重定向或扩展指令。
                        </li>
                        <li>
                          双击Escape键回到历史记录，编辑之前的提示，并探索不同的方向。您可以编辑提示并重复，直到获得您想要的结果。
                        </li>
                        <li>
                          要求Claude撤销更改，通常与选项#2结合使用以采取不同的方法。
                        </li>
                      </ol>
                      <p>
                        虽然Claude Code偶尔会在第一次尝试时完美解决问题，但使用这些修正工具通常能更快产生更好的解决方案。
                      </p>

                      <h5>f. 使用/clear保持上下文专注</h5>
                      <p>在长会话期间，Claude的上下文窗口可能会被无关的对话、文件内容和命令填满。在任务之间频繁使用/clear命令重置上下文窗口。</p>

                      <h5>g. 为复杂工作流程使用检查清单和草稿本</h5>
                      <p>对于有多个步骤或需要详尽解决方案的大型任务——如代码迁移、修复大量lint错误或运行复杂构建脚本——通过让Claude使用Markdown文件（甚至GitHub问题！）作为检查清单和工作草稿本来改善性能：</p>
                      <p>
                        例如，要修复大量的lint问题，您可以执行以下操作：
                      </p>
                      <ol>
                        <li>告诉Claude运行lint命令并将所有产生的错误（包括文件名和行号）写入Markdown检查清单</li>
                        <li>指示Claude逐一解决每个问题，在检查完成并移动到下一个之前修复和验证</li>
                      </ol>

                      <h5>h. 将数据传递给Claude</h5>
                      <p>向Claude提供数据有几种方法：</p>
                      <ol>
                        <li>直接复制粘贴到您的提示中（最常见的方法）</li>
                        <li>管道传输到Claude Code（例如，cat foo.txt | claude），对于日志、CSV和大数据特别有用</li>
                        <li>告诉Claude通过bash命令、MCP工具或自定义斜杠命令拉取数据</li>
                        <li>要求Claude读取文件或获取URL（对图像也有效）</li>
                      </ol>
                      <p>
                        大多数会话涉及这些方法的组合。例如，您可以管道传入日志文件，然后告诉Claude使用工具拉取额外的上下文来调试日志。
                      </p>
                    </section>

                    <section>
                      <h4>5. 使用无头模式自动化您的基础设施</h4>
                      <p>Claude Code包含无头模式，用于CI、预提交钩子、构建脚本和自动化等非交互式上下文。使用-p标志和提示来启用无头模式，使用--output-format stream-json进行流式JSON输出。</p>
                      <p>注意无头模式不会在会话之间持续。您必须在每个会话中触发它。</p>
                      <h5>a. 使用Claude进行问题分类</h5>
                      <p>无头模式可以为GitHub事件触发的自动化提供动力，例如在您的仓库中创建新问题时。例如，公共Claude Code仓库使用Claude检查新问题并分配适当的标签。</p>

                      <h5>b. 使用Claude作为代码检查器</h5>
                      <p>Claude Code可以提供超越传统linting工具检测的主观代码审查，识别拼写错误、过时注释、误导性函数或变量名等问题。</p>
                    </section>

                    <section>
                      <h4>6. 通过多Claude工作流程提升</h4>
                      <p>除了独立使用外，一些最强大的应用涉及并行运行多个Claude实例：</p>

                      <h5>a. 让一个Claude编写代码；使用另一个Claude验证</h5>
                      <p>一个简单但有效的方法是让一个Claude编写代码，而另一个Claude审查或测试它。类似于与多个工程师合作，有时拥有独立的上下文是有益的：</p>
                      <ol>
                        <li>使用Claude编写代码</li>
                        <li>运行/clear或在另一个终端中启动第二个Claude</li>
                        <li>让第二个Claude审查第一个Claude的工作</li>
                        <li>启动另一个Claude（或再次/clear）来阅读代码和审查反馈</li>
                        <li>让这个Claude基于反馈编辑代码</li>
                      </ol>
                      <p>
                        您可以对测试做类似的事情：让一个Claude编写测试，然后让另一个Claude编写代码使测试通过。您甚至可以通过给Claude实例分配单独的工作草稿本，并告诉它们写入哪一个和从哪一个读取，让它们相互通信。
                      </p>
                      <p>这种分离通常比让单个Claude处理所有事情产生更好的结果。
                      </p>
                      <h5>b. 拥有仓库的多个检出</h5>
                      <p>Anthropic的许多工程师不是等待Claude完成每个步骤，而是这样做：</p>
                      <ol>
                        <li>在单独的文件夹中创建3-4个git检出</li>
                        <li>在单独的终端标签中打开每个文件夹</li>
                        <li>在每个文件夹中用不同的任务启动Claude</li>
                        <li>循环检查进度并批准/拒绝权限请求</li>
                      </ol>
                      <h5>c. 使用git worktrees</h5>
                      <p>这种方法在多个独立任务中表现出色，提供了比多个检出更轻量级的替代方案。Git worktrees允许您将同一仓库的多个分支检出到单独的目录中。每个worktree都有自己的工作目录和隔离的文件，同时共享相同的Git历史记录和reflog。</p>
                      <p>使用git worktrees使您能够在项目的不同部分同时运行多个Claude会话，每个会话专注于自己的独立任务。例如，您可能有一个Claude重构身份验证系统，而另一个构建完全不相关的数据可视化组件。由于任务不重叠，每个Claude都可以全速工作，无需等待另一个的更改或处理合并冲突：</p>
                      <ol>
                        <li>创建worktrees：git worktree add ../project-feature-a feature-a
                        </li>
                        <li>在每个worktree中启动Claude：cd ../project-feature-a && claude
                        </li>
                        <li>根据需要创建额外的worktrees（在新的终端标签中重复步骤1-2）
                        </li>
                      </ol>
                      <p>一些提示：</p>
                      <ol>
                        <li>使用一致的命名约定
                        </li>
                        <li>为每个worktree维护一个终端标签
                        </li>
                        <li>如果您在Mac上使用iTerm2，请设置当Claude需要注意时的通知
                        </li>
                        <li>为不同的worktrees使用单独的IDE窗口
                        </li>
                        <li>完成时清理：git worktree remove ../project-feature-a
                        </li>
                      </ol>
                      <h5>d. 使用带有自定义工具的无头模式</h5>
                      <p>claude -p（无头模式）将Claude Code程序化集成到更大的工作流程中，同时利用其内置工具和系统提示。</p>
                      <ol>
                        <li>扇出处理大型迁移或分析（例如，分析数百个日志中的情感或分析数千个CSV）：
                          <ol>
                            <li>
让Claude编写一个脚本来生成任务列表。例如，生成需要从框架A迁移到框架B的2k个文件列表。
                            </li>
                            <li>
                              循环执行任务，为每个任务程序化调用Claude并给它一个任务和一组可以使用的工具。例如：claude -p "将foo.py从React迁移到Vue。完成后，如果成功您必须返回字符串OK，如果任务失败则返回FAIL。" --allowedTools Edit Bash(git commit:*)
                            </li>
                            <li>
                              多次运行脚本并改进您的提示以获得所需的结果。
                            </li>
                          </ol>
                        </li>
                        <li>管道化将Claude集成到现有的数据/处理管道中：
                           <ol>
                            <li>调用claude -p "您的提示" --json | your_command，其中your_command是处理管道的下一步
                            </li>
                            <li>
                              就是这样！JSON输出（可选）可以帮助为更容易的自动化处理提供结构。
                            </li>
                          </ol>
                        </li>
                      </ol>
                      <p>对于这两种用例，使用--verbose标志来调试Claude调用可能会有帮助。我们通常建议在生产中关闭详细模式以获得更清洁的输出。
                      </p>
                      <p>您在使用Claude Code方面有什么提示和最佳实践？标记@AnthropicAI，这样我们就能看到您在构建什么！</p>
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