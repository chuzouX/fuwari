
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Icon from '@iconify/svelte';

  interface Props {
    umamiConfig?: {
      enable: boolean;
      baseUrl: string;
      shareId: string;
      timezone: string;
    };
  }

  let { umamiConfig }: Props = $props();

  const pagePath = '/schedule/';
  let pageViews: number = $state(0);
  let isLoadingViews: boolean = $state(true);


  interface TimeSlot {
    node: number;
    startTime: string;
    endTime: string;
    timeTable: number;
  }

  interface CourseSource {
    id: number;
    courseName: string;
    color: string;
    credit: number;
    note: string;
    tableId: number;
  }

  interface ScheduleItem {
    id: number;
    day: number;
    startWeek: number;
    endWeek: number;
    startNode: number;
    step: number;
    room: string;
    teacher: string;
    type: number;
    tableId: number;
    level: number;
    ownTime: boolean;
    startTime: string;
    endTime: string;
  }

  interface ScheduleConfig {
    startDate: string;
    maxWeek: number;
    nodes: number;
    showSat: boolean;
    showSun: boolean;
    tableName: string;
  }

  interface ScheduleData {
    config: ScheduleConfig;
    timeSlots: TimeSlot[];
    sources: CourseSource[];
    schedules: ScheduleItem[];
  }

  interface CourseWithStatus {
    course: CourseSource;
    schedule: ScheduleItem;
    timeRange: string;
    isCurrent: boolean;
    progress: number;
    isCompleted: boolean;
    startMinutes: number;
    endMinutes: number;
  }

  const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // 解析课程名称，提取括号内的标记
  function parseCourseName(name: string): { mainName: string; badges: string[] } {
    const badges: string[] = [];
    // 匹配中文括号（）或英文括号 ()
    const badgePattern = /[（(]([^）)]+)[）)]/g;
    let match;
    
    while ((match = badgePattern.exec(name)) !== null) {
      badges.push(match[1]);
    }
    
    // 移除所有括号内容得到主名称
    const mainName = name.replace(/[（(][^）)]+[）)]/g, '').trim();
    
    return { mainName, badges };
  }

  let scheduleData: ScheduleData | null = $state(null);
  let viewMode: 'today' | 'week' = $state('today');
  let currentWeek = $state(1);
  let currentDay = $state(1);
  let semesterStart: Date;
  let loading = $state(true);
  let updateInterval: ReturnType<typeof setInterval>;
  let showCompletedCourses = $state(false);
  let currentTimeMinutes = $state(0);

  // 计算当前是第几周第几天
  function calculateCurrentWeekAndDay() {
    if (!scheduleData) return;
    
    const now = new Date();
    semesterStart = new Date(scheduleData.config.startDate.replace(/-/g, '/'));
    const diffTime = now.getTime() - semesterStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // 计算当前周 (从1开始)
    currentWeek = Math.floor(diffDays / 7) + 1;
    if (currentWeek < 1) currentWeek = 1;
    if (currentWeek > scheduleData.config.maxWeek) currentWeek = scheduleData.config.maxWeek;
    
    // 计算当前是周几 (1-7, 周一是1)
    currentDay = (now.getDay() + 6) % 7 + 1;
    
    // 更新当前时间（分钟）
    currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
  }

  // 获取时间槽信息
  function getTimeSlot(node: number): TimeSlot | undefined {
    return scheduleData?.timeSlots.find(t => t.node === node);
  }

  // 格式化时间范围
  function formatTimeRange(schedule: ScheduleItem): string {
    // 如果有自定义时间 (ownTime=true)，直接使用 startTime 和 endTime
    if (schedule.ownTime && schedule.startTime && schedule.endTime) {
      return `${schedule.startTime}-${schedule.endTime}`;
    }
    // 否则通过 node 查时间表
    const startSlot = getTimeSlot(schedule.startNode);
    const endSlot = getTimeSlot(schedule.startNode + schedule.step - 1);
    if (!startSlot || !endSlot) return '';
    return `${startSlot.startTime}-${endSlot.endTime}`;
  }

  // 获取课程的开始和结束时间（分钟）
  function getCourseTimeRange(schedule: ScheduleItem): { start: number; end: number } {
    const startSlot = getTimeSlot(schedule.startNode);
    const endSlot = getTimeSlot(schedule.startNode + schedule.step - 1);
    
    if (!startSlot || !endSlot) return { start: 0, end: 0 };
    
    const [startHour, startMin] = startSlot.startTime.split(':').map(Number);
    const [endHour, endMin] = endSlot.endTime.split(':').map(Number);
    
    return {
      start: startHour * 60 + startMin,
      end: endHour * 60 + endMin
    };
  }

  // 获取今日课程（带状态）
  function getTodayCoursesWithStatus(): CourseWithStatus[] {
    if (!scheduleData) return [];
    
    const result: CourseWithStatus[] = [];
    
    scheduleData.schedules.forEach(schedule => {
      // 检查是否在今天
      if (schedule.day !== currentDay) return;
      // 检查是否在本周
      if (currentWeek < schedule.startWeek || currentWeek > schedule.endWeek) return;
      
      const course = scheduleData!.sources.find(c => c.id === schedule.id);
      if (course) {
        const timeRange = formatTimeRange(schedule);
        const { start, end } = getCourseTimeRange(schedule);
        
        const isCurrent = currentTimeMinutes >= start && currentTimeMinutes < end;
        const isCompleted = currentTimeMinutes >= end;
        
        let progress = 0;
        if (isCurrent) {
          const totalDuration = end - start;
          const elapsed = currentTimeMinutes - start;
          progress = Math.round((elapsed / totalDuration) * 100);
        } else if (isCompleted) {
          progress = 100;
        }
        
        result.push({
          course,
          schedule,
          timeRange,
          isCurrent,
          progress,
          isCompleted,
          startMinutes: start,
          endMinutes: end
        });
      }
    });
    
    // 按开始节次排序
    result.sort((a, b) => a.schedule.startNode - b.schedule.startNode);
    
    return result;
  }

  // 获取今日课程（过滤后的）
  function getTodayCourses(): CourseWithStatus[] {
    const courses = getTodayCoursesWithStatus();
    
    if (showCompletedCourses) {
      return courses;
    }
    
    // 隐藏已过时间的课程
    return courses.filter(c => !c.isCompleted);
  }

  // 获取本周课程
  function getWeekCourses(): Array<{ day: number; dayName: string; isToday: boolean; courses: Array<{ course: CourseSource; schedule: ScheduleItem; timeRange: string; isCurrent: boolean; progress: number; isCompleted: boolean }> }> {
    if (!scheduleData) return [];
    
    const weekDays: Array<{ day: number; dayName: string; isToday: boolean; courses: Array<{ course: CourseSource; schedule: ScheduleItem; timeRange: string; isCurrent: boolean; progress: number; isCompleted: boolean }> }> = [];
    
    for (let day = 1; day <= 7; day++) {
      const dayCourses: Array<{ course: CourseSource; schedule: ScheduleItem; timeRange: string; isCurrent: boolean; progress: number; isCompleted: boolean }> = [];
      
      scheduleData.schedules.forEach(schedule => {
        if (schedule.day !== day) return;
        if (currentWeek < schedule.startWeek || currentWeek > schedule.endWeek) return;
        
        const course = scheduleData!.sources.find(c => c.id === schedule.id);
        if (course) {
          const timeRange = formatTimeRange(schedule);
          const { start, end } = getCourseTimeRange(schedule);
          
          const isToday = day === currentDay;
          const isCurrent = isToday && currentTimeMinutes >= start && currentTimeMinutes < end;
          const isCompleted = isToday && currentTimeMinutes >= end;
          
          let progress = 0;
          if (isCurrent) {
            const totalDuration = end - start;
            const elapsed = currentTimeMinutes - start;
            progress = Math.round((elapsed / totalDuration) * 100);
          } else if (isCompleted) {
            progress = 100;
          }
          
          dayCourses.push({
            course,
            schedule,
            timeRange,
            isCurrent,
            progress,
            isCompleted
          });
        }
      });
      
      // 按开始节次排序
      dayCourses.sort((a, b) => a.schedule.startNode - b.schedule.startNode);
      
      // 如果不是今天或者开启了显示已完成课程，不过滤
      if (day !== currentDay || showCompletedCourses) {
        weekDays.push({
          day,
          dayName: DAY_NAMES[day - 1],
          isToday: day === currentDay,
          courses: dayCourses
        });
      } else {
        // 今天是当前天，且隐藏已完成课程
        weekDays.push({
          day,
          dayName: DAY_NAMES[day - 1],
          isToday: day === currentDay,
          courses: dayCourses.filter(c => !c.isCompleted)
        });
      }
    }
    
    return weekDays;
  }

  // 更新时间
  function updateTime() {
    calculateCurrentWeekAndDay();
  }

  // 加载数据
  async function loadScheduleData() {
    try {
      const [configRes, timeRes, sourcesRes, mainRes] = await Promise.all([
        fetch('/schedule/schedule_config.json'),
        fetch('/schedule/schedule_time.json'),
        fetch('/schedule/schedule_sources.json'),
        fetch('/schedule/schedule_main.json')
      ]);

      const [config, timeSlots, sources, schedules] = await Promise.all([
        configRes.json(),
        timeRes.json(),
        sourcesRes.json(),
        mainRes.json()
      ]);

      scheduleData = {
        config,
        timeSlots,
        sources,
        schedules
      };

      calculateCurrentWeekAndDay();
      
      // 每分钟更新一次当前时间状态
      updateInterval = setInterval(() => {
        updateTime();
      }, 60000);
    } catch (error) {
      console.error('Failed to load schedule data:', error);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadScheduleData();
    fetchPageViews();
  });

  async function fetchPageViews() {
    if (!umamiConfig?.enable) return;
    
    if (typeof window.fetchUmamiStats !== 'function') {
      console.warn('fetchUmamiStats is not available');
      isLoadingViews = false;
      return;
    }
    
    try {
      const statsData = await window.fetchUmamiStats(umamiConfig.baseUrl, umamiConfig.shareId, {
        timezone: umamiConfig.timezone,
        path: `eq.${pagePath}`
      });
      const pv = statsData.pageviews;
      if (typeof pv === 'object' && pv !== null) {
        pageViews = pv.value || 0;
      } else if (typeof pv === 'number') {
        pageViews = pv;
      } else {
        pageViews = 0;
      }
    } catch (error) {
      console.error('Error fetching page views:', error);
    } finally {
      isLoadingViews = false;
    }
  }

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<div class="schedule-viewer">
  <!-- 头部信息 -->
  <div class="flex items-start justify-between gap-3 mb-6">
    <div class="min-w-0">
      <h1 class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
        chuzouX的课程表
      </h1>
      <div class="flex items-center gap-4 flex-wrap">
        <p class="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          第 {currentWeek} 周 · {DAY_NAMES[currentDay - 1]}
          {#if scheduleData}
            <span class="ml-1 sm:ml-2 text-xs opacity-75">({scheduleData.config.tableName})</span>
          {/if}
        </p>
        <!-- 访问量显示 -->
        <div class="flex items-center">
          <div class="meta-icon">
            <Icon icon="material-symbols:visibility-outline" class="text-base"></Icon>
          </div>
          <span class="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            访问量 {isLoadingViews ? '-' : `${pageViews} 次`}
          </span>
        </div>
      </div>
    </div>
    
    <!-- 右侧控制区：开关 + 切换按钮 -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- 显示已完成课程开关 - 仅在今日视图显示 -->
      {#if viewMode === 'today'}
        <button 
          class="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all border"
          class:border-primary={showCompletedCourses}
          class:bg-primary={showCompletedCourses}
          class:text-white={showCompletedCourses}
          class:border-neutral-200={!showCompletedCourses}
          class:dark:border-neutral-700={!showCompletedCourses}
          class:bg-neutral-100={!showCompletedCourses}
          class:dark:bg-neutral-800={!showCompletedCourses}
          class:text-neutral-600={!showCompletedCourses}
          class:dark:text-neutral-400={!showCompletedCourses}
          on:click={() => showCompletedCourses = !showCompletedCourses}
          title={showCompletedCourses ? '隐藏已上课程' : '显示已上课程'}
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            {#if showCompletedCourses}
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            {:else}
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            {/if}
          </svg>
          <span class="hidden sm:inline">{showCompletedCourses ? '显示已上' : '隐藏已上'}</span>
        </button>
      {/if}
      
      <!-- 今日/本周切换按钮 -->
      <div class="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
        <button 
          class="px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all"
          class:bg-white={viewMode === 'today'}
          class:dark:bg-neutral-700={viewMode === 'today'}
          class:shadow-sm={viewMode === 'today'}
          class:text-primary={viewMode === 'today'}
          class:text-neutral-600={viewMode !== 'today'}
          class:dark:text-neutral-400={viewMode !== 'today'}
          on:click={() => viewMode = 'today'}
        >
          今日
        </button>
        <button 
          class="px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all"
          class:bg-white={viewMode === 'week'}
          class:dark:bg-neutral-700={viewMode === 'week'}
          class:shadow-sm={viewMode === 'week'}
          class:text-primary={viewMode === 'week'}
          class:text-neutral-600={viewMode !== 'week'}
          class:dark:text-neutral-400={viewMode !== 'week'}
          on:click={() => viewMode = 'week'}
        >
          本周
        </button>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
  {:else if !scheduleData}
    <div class="text-center py-12 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
      <p class="text-lg">加载课程数据失败</p>
    </div>
  {:else}
    {#if viewMode === 'today'}
      <!-- 今日课程视图 -->
      {#if getTodayCourses().length === 0}
        <div class="text-center py-12 text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
          <p class="text-lg font-medium">chuzouX今天的课上完了哦</p>
          <p class="text-sm mt-1">赶快去骚扰他（雾</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each getTodayCourses() as { course, schedule, timeRange, isCurrent, progress, isCompleted }}
            <div 
              class="course-card relative rounded-xl p-4 border border-black/5 dark:border-white/5 transition-all hover:shadow-md overflow-hidden"
              class:is-current={isCurrent}
              class:is-completed={isCompleted}
            >
              <!-- 背景进度条（仅当前课程显示） -->
              {#if isCurrent}
                <div 
                  class="absolute inset-0 bg-primary/10 transition-all duration-500"
                  style="width: {progress}%"
                ></div>
              {/if}
              
              <div class="relative z-10 flex items-center gap-4 py-2">
                <!-- 时间段（主题色） -->
                <div class="flex-shrink-0 w-24 text-base font-medium text-primary whitespace-nowrap">
                  {timeRange}
                </div>
                
                <!-- 分隔线（主题色） -->
                <div class="w-px h-8 self-center bg-primary/30"></div>
                
                <!-- 课程名称 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {parseCourseName(course.courseName).mainName}
                    </h3>
                    {#each parseCourseName(course.courseName).badges as badge}
                      <span class="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                        {badge}
                      </span>
                    {/each}
                  </div>
                  {#if schedule.room || schedule.teacher}
                    <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {schedule.room}{schedule.room && schedule.teacher ? ' · ' : ''}{schedule.teacher}
                    </p>
                  {/if}
                </div>
                
                <!-- 状态 Badge -->
                {#if isCurrent}
                  <span class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-white">
                    进行中
                  </span>
                {:else if isCompleted}
                  <span class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                    已结束
                  </span>
                {:else}
                  <span class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    待开始
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- 本周课程视图 -->
      <div class="space-y-6">
        {#each getWeekCourses() as { day, dayName, isToday, courses }}
          <div class="week-day">
            <h3 class="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs" class:bg-primary={isToday} class:text-white={isToday}>
                {day}
              </span>
              {dayName}
              {#if isToday}
                <span class="px-2 py-0.5 rounded-full bg-primary text-white text-xs">今天</span>
              {/if}
            </h3>
            
            {#if courses.length === 0}
              <div class="text-sm text-neutral-400 dark:text-neutral-500 py-2">
                无课程
              </div>
            {:else}
              <div class="space-y-2">
                {#each courses as { course, schedule, timeRange, isCurrent, progress, isCompleted }}
                  <div 
                    class="course-card relative rounded-lg p-3 border border-black/5 dark:border-white/5 transition-all hover:shadow-sm overflow-hidden"
                    class:is-current={isCurrent}
                  >
                    <!-- 背景进度条（仅当前课程显示） -->
                    {#if isCurrent}
                      <div 
                        class="absolute inset-0 bg-primary/10 transition-all duration-500"
                        style="width: {progress}%"
                      ></div>
                    {/if}
                    
                    <div class="relative z-10 flex items-center gap-4 py-2">
                      <!-- 时间（主题色） -->
                      <div class="flex-shrink-0 w-24 text-base font-medium text-primary whitespace-nowrap">
                        {timeRange}
                      </div>
                      
                      <!-- 分隔线（主题色） -->
                      <div class="w-px h-8 self-center bg-primary/30"></div>
                      
                      <!-- 课程名 -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {parseCourseName(course.courseName).mainName}
                          </div>
                          {#each parseCourseName(course.courseName).badges as badge}
                            <span class="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary">
                              {badge}
                            </span>
                          {/each}
                        </div>
                        {#if schedule.room || schedule.teacher}
                          <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {schedule.room}{schedule.room && schedule.teacher ? ' · ' : ''}{schedule.teacher}
                          </p>
                        {/if}
                      </div>
                      
                      <!-- 状态 Badge -->
                      {#if isCurrent}
                        <span class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                          进行中
                        </span>
                      {:else if isCompleted}
                        <span class="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                          已结束
                        </span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .schedule-viewer {
    color: var(--text-color);
  }
  
  .course-card {
    backdrop-filter: blur(8px);
    background-color: var(--card-bg);
  }
  
  .course-card.is-current {
    box-shadow: 0 0 0 1px var(--primary) inset;
  }
  
  .course-card.is-completed {
    opacity: 0.7;
  }
  
  .text-primary {
    color: var(--primary);
  }
  
  .bg-primary {
    background-color: var(--primary);
  }
  
  .bg-primary\/10 {
    background-color: color-mix(in oklch, var(--primary) 10%, transparent);
  }
  
  .border-primary {
    border-color: var(--primary);
  }
</style>