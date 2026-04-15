import os
import json


def parse_txt_to_json(base_path):
    all_chapters = {}

    # 遍历 challenges 下的文件夹 (chapter1, chapter2...)
    chapters = [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d))]
    """ 等价于
    for d in os.listdir(base_path):
        new_path = os.path.join(d)
        if os.path.isdir(new_path):
            chapters.append(d)
    """

    for chapter in sorted(chapters):
        chapter_key = chapter  # 如 "chapter1"
        all_chapters[chapter_key] = []

        chapter_path = os.path.join(base_path, chapter)
        # 获取该目录下所有的 .txt 文件并排序
        files = [f for f in os.listdir(chapter_path) if f.endswith('.txt')]
        """ 等价于
        for f in os.listdir(chapter_path):
            if f.endswith('.txt'):
                files.append(f)
        """
        files.sort(key=lambda x: int(x.split('.')[0]))  # 按数字 1, 2, 3 排序

        for file in files:
            file_path = os.path.join(chapter_path, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]
                """
                strip()函数的意思是移除字符串开头和结尾的空白字符。
                for line in f.readlines():
                    if line.strip():
                        lines.append(line.strip())
                """

                # --- 解析逻辑 ---
                # 假设 lines 是 strip() 后的列表
                name = lines[0]
                # split()函数默认以空格（或多个空格、制表符）为分隔符切开字符串。
                rows, cols = map(int, lines[1].split())

                # 根据 rows 动态截取
                actual_map = lines[2: 2 + rows]
                opened_map = lines[2 + rows: 2 + 2 * rows]

                # 雷数在地图结束后的第一行
                remaining_mines = int(lines[2 + 2 * rows])

                # 标语在雷数之后（如果有的话）
                quote = lines[2 + 2 * rows + 1] if len(lines) > 2 + 2 * rows + 1 else ""

                # 构建单个关卡对象
                level_data = {
                    "id": int(file.split('.')[0]),
                    "name": name,
                    "rows": rows,
                    "cols": cols,
                    "actual_map": actual_map,
                    "opened_map": opened_map,
                    "remaining_mines": remaining_mines,
                    "quote": quote
                }
                all_chapters[chapter_key].append(level_data)

    return all_chapters

if __name__ == "__main__":
    # 设定你的路径
    input_dir = r"C:\Users\lenovo\Desktop\vscode_code\minesweeper\assets\challenges"
    output_file = r"C:\Users\lenovo\Desktop\vscode_code\minesweeper\assets\challenges\level.json"

    # 确保输出目录存在
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # 执行转换
    result = parse_txt_to_json(input_dir)

    # 写入 JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=4)

    print(f"转换成功！文件已保存至: {output_file}")